<?php

namespace App\Services;

use App\Events\FriendRemoved;
use App\Events\FriendRequestAccepted;
use App\Events\FriendRequestReceived;
use App\Events\FriendRequestRejected;
use App\Models\FriendRequest;
use App\Models\Friendship;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserPrivacySetting;
use App\Support\BroadcastDispatcher;
use App\Support\PhoneNormalizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class FriendService
{
    public function resolveByPhone(User $authUser, string $phoneNumber): ?User
    {
        $normalizedInput = PhoneNormalizer::normalize($phoneNumber);
        if ($normalizedInput === null) {
            return null;
        }

        $candidates = User::query()
            ->whereNotNull('phone_number')
            ->where('is_phone_verified', true)
            ->where('account_status', 'active')
            ->where('id', '!=', $authUser->id)
            ->get();

        $target = $candidates->first(function (User $user) use ($normalizedInput): bool {
            return PhoneNormalizer::normalize($user->phone_number) === $normalizedInput;
        });

        if (! $target) {
            return null;
        }

        $privacy = $this->privacyFor($target);
        if (! $privacy->allow_find_by_phone) {
            return null;
        }

        if ($this->isBlockedEitherDirection($authUser->id, $target->id)) {
            return null;
        }

        return $target;
    }

    public function sendRequest(User $authUser, User $targetUser, ?string $message, ?string $targetPhone = null): array
    {
        if ((int) $authUser->id === (int) $targetUser->id) {
            throw new \DomainException('You cannot send a friend request to yourself.');
        }

        if ($targetUser->account_status !== 'active') {
            throw new \DomainException('Target account is not available.');
        }

        if ($this->areFriends($authUser->id, $targetUser->id)) {
            throw new \DomainException('You are already friends.');
        }

        if ($this->isBlockedEitherDirection($authUser->id, $targetUser->id)) {
            throw new \DomainException('Friend request cannot be sent.');
        }

        $privacy = $this->privacyFor($targetUser);
        if (! $privacy->allow_friend_request) {
            throw new \DomainException('This user is not accepting friend requests.');
        }

        $pending = FriendRequest::query()
            ->where('requester_id', $authUser->id)
            ->where('addressee_id', $targetUser->id)
            ->where('status', 'pending')
            ->first();

        if ($pending) {
            return [$pending->load(['requester', 'addressee']), false, false];
        }

        $request = FriendRequest::create([
            'requester_id' => $authUser->id,
            'addressee_id' => $targetUser->id,
            'phone_snapshot' => $targetPhone,
            'message' => $message,
            'status' => 'pending',
        ]);

        $this->safeBroadcast(new FriendRequestReceived($request->fresh()));

        if (! $privacy->auto_accept_contacts) {
            return [$request->load(['requester', 'addressee']), true, false];
        }

        [$acceptedRequest] = $this->acceptRequest($targetUser, (int) $request->id);

        return [$acceptedRequest->load(['requester', 'addressee']), true, true];
    }

    public function incoming(User $authUser, int $perPage): LengthAwarePaginator
    {
        return FriendRequest::query()
            ->with(['requester', 'addressee'])
            ->where('addressee_id', $authUser->id)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function outgoing(User $authUser, int $perPage): LengthAwarePaginator
    {
        return FriendRequest::query()
            ->with(['requester', 'addressee'])
            ->where('requester_id', $authUser->id)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function acceptRequest(User $authUser, int $requestId): array
    {
        return DB::transaction(function () use ($authUser, $requestId): array {
            $request = FriendRequest::query()->lockForUpdate()->find($requestId);

            if (! $request || (int) $request->addressee_id !== (int) $authUser->id) {
                throw new \RuntimeException('not_found');
            }

            if ($request->status !== 'pending') {
                throw new \DomainException('Friend request is no longer pending.');
            }

            [$low, $high] = $this->orderedPair((int) $request->requester_id, (int) $request->addressee_id);

            $friendship = Friendship::firstOrCreate(
                [
                    'user_low_id' => $low,
                    'user_high_id' => $high,
                ],
                [
                    'created_by' => $authUser->id,
                    'created_at' => now(),
                ]
            );

            $request->status = 'accepted';
            $request->responded_at = now();
            $request->save();

            $this->safeBroadcast(new FriendRequestAccepted((int) $request->requester_id, (int) $request->addressee_id, $friendship));
            $this->safeBroadcast(new FriendRequestAccepted((int) $request->addressee_id, (int) $request->requester_id, $friendship));

            return [$request->fresh(['requester', 'addressee']), $friendship->fresh()];
        });
    }

    public function rejectRequest(User $authUser, int $requestId): FriendRequest
    {
        $request = FriendRequest::query()->find($requestId);
        if (! $request || (int) $request->addressee_id !== (int) $authUser->id) {
            throw new \RuntimeException('not_found');
        }

        if ($request->status !== 'pending') {
            throw new \DomainException('Friend request is no longer pending.');
        }

        $request->status = 'rejected';
        $request->responded_at = now();
        $request->save();

        $this->safeBroadcast(new FriendRequestRejected((int) $request->requester_id, $request->fresh()));

        return $request->fresh(['requester', 'addressee']);
    }

    public function cancelRequest(User $authUser, int $requestId): FriendRequest
    {
        $request = FriendRequest::query()->find($requestId);
        if (! $request || (int) $request->requester_id !== (int) $authUser->id) {
            throw new \RuntimeException('not_found');
        }

        if ($request->status !== 'pending') {
            throw new \DomainException('Friend request is no longer pending.');
        }

        $request->status = 'cancelled';
        $request->responded_at = now();
        $request->save();

        return $request->fresh(['requester', 'addressee']);
    }

    public function listFriends(User $authUser, int $perPage): array
    {
        $page = max(1, (int) request()->query('page', 1));

        $friendships = Friendship::query()
            ->where(function ($query) use ($authUser): void {
                $query->where('user_low_id', $authUser->id)
                    ->orWhere('user_high_id', $authUser->id);
            })
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);

        $items = collect($friendships->items())->map(function (Friendship $friendship) use ($authUser): array {
            $friendId = (int) $friendship->user_low_id === (int) $authUser->id
                ? (int) $friendship->user_high_id
                : (int) $friendship->user_low_id;

            $friend = User::query()->find($friendId);

            return [
                'friendship_id' => $friendship->id,
                'created_at' => optional($friendship->created_at)?->format('Y-m-d H:i:s.v'),
                'friend' => $friend,
            ];
        })->values()->all();

        return [
            'items' => $items,
            'meta' => [
                'current_page' => $friendships->currentPage(),
                'last_page' => $friendships->lastPage(),
                'per_page' => $friendships->perPage(),
                'total' => $friendships->total(),
            ],
        ];
    }

    public function removeFriend(User $authUser, int $friendUserId): void
    {
        [$low, $high] = $this->orderedPair((int) $authUser->id, $friendUserId);

        $friendship = Friendship::query()
            ->where('user_low_id', $low)
            ->where('user_high_id', $high)
            ->first();

        if (! $friendship) {
            throw new \RuntimeException('not_found');
        }

        $friendship->delete();

        $this->safeBroadcast(new FriendRemoved((int) $authUser->id, $friendUserId));
        $this->safeBroadcast(new FriendRemoved($friendUserId, (int) $authUser->id));
    }

    private function areFriends(int $userA, int $userB): bool
    {
        [$low, $high] = $this->orderedPair($userA, $userB);

        return Friendship::query()
            ->where('user_low_id', $low)
            ->where('user_high_id', $high)
            ->exists();
    }

    private function orderedPair(int $userA, int $userB): array
    {
        return [min($userA, $userB), max($userA, $userB)];
    }

    private function privacyFor(User $user): UserPrivacySetting
    {
        return UserPrivacySetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'allow_find_by_phone' => true,
                'allow_friend_request' => true,
                'auto_accept_contacts' => false,
            ]
        );
    }

    private function isBlockedEitherDirection(int $userA, int $userB): bool
    {
        return UserBlock::query()
            ->where(function ($query) use ($userA, $userB): void {
                $query->where('blocker_id', $userA)->where('blocked_id', $userB);
            })
            ->orWhere(function ($query) use ($userA, $userB): void {
                $query->where('blocker_id', $userB)->where('blocked_id', $userA);
            })
            ->exists();
    }

    private function safeBroadcast(object $event): void
    {
        BroadcastDispatcher::dispatch($event);
    }
}
