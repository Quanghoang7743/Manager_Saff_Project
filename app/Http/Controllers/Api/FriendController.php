<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResolveFriendByPhoneRequest;
use App\Http\Requests\StoreFriendRequestRequest;
use App\Http\Resources\FriendRequestResource;
use App\Http\Resources\FriendResource;
use App\Http\Resources\UserSummaryResource;
use App\Models\User;
use App\Services\FriendService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly FriendService $friendService) {}

    public function resolveByPhone(ResolveFriendByPhoneRequest $request): JsonResponse
    {
        $target = $this->friendService->resolveByPhone($request->user(), $request->validated()['phone_number']);

        if (! $target) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        return $this->successResponse('User resolved successfully.', [
            'user' => new UserSummaryResource($target),
        ]);
    }

    public function sendRequest(StoreFriendRequestRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $targetUser = null;
        if (! empty($payload['target_user_id'])) {
            $targetUser = User::find((int) $payload['target_user_id']);
        }

        if (! $targetUser && ! empty($payload['target_phone'])) {
            $targetUser = $this->friendService->resolveByPhone($request->user(), $payload['target_phone']);
        }

        if (! $targetUser) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            [$friendRequest, $created, $autoAccepted] = $this->friendService->sendRequest(
                $request->user(),
                $targetUser,
                $payload['message'] ?? null,
                $payload['target_phone'] ?? null,
            );
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 422);
        }

        $message = $autoAccepted
            ? 'Friend request auto-accepted.'
            : ($created ? 'Friend request sent successfully.' : 'Friend request is already pending.');

        return $this->successResponse($message, [
            'friend_request' => new FriendRequestResource($friendRequest),
            'auto_accepted' => $autoAccepted,
        ], $created ? 201 : 200);
    }

    public function incoming(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', (int) config('friends.incoming_per_page', 20)), 100));
        $paginator = $this->friendService->incoming($request->user(), $perPage);

        return $this->successResponse('Incoming friend requests fetched successfully.', [
            'items' => FriendRequestResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function outgoing(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', (int) config('friends.outgoing_per_page', 20)), 100));
        $paginator = $this->friendService->outgoing($request->user(), $perPage);

        return $this->successResponse('Outgoing friend requests fetched successfully.', [
            'items' => FriendRequestResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function accept(Request $request, int $id): JsonResponse
    {
        try {
            [$friendRequest, $friendship] = $this->friendService->acceptRequest($request->user(), $id);
        } catch (\RuntimeException) {
            return $this->errorResponse('Resource not found', [], 404);
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 422);
        }

        return $this->successResponse('Friend request accepted successfully.', [
            'friend_request' => new FriendRequestResource($friendRequest),
            'friendship_id' => $friendship->id,
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        try {
            $friendRequest = $this->friendService->rejectRequest($request->user(), $id);
        } catch (\RuntimeException) {
            return $this->errorResponse('Resource not found', [], 404);
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 422);
        }

        return $this->successResponse('Friend request rejected successfully.', [
            'friend_request' => new FriendRequestResource($friendRequest),
        ]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        try {
            $friendRequest = $this->friendService->cancelRequest($request->user(), $id);
        } catch (\RuntimeException) {
            return $this->errorResponse('Resource not found', [], 404);
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 422);
        }

        return $this->successResponse('Friend request cancelled successfully.', [
            'friend_request' => new FriendRequestResource($friendRequest),
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', (int) config('friends.friends_per_page', 30)), 100));
        $result = $this->friendService->listFriends($request->user(), $perPage);

        return $this->successResponse('Friends fetched successfully.', [
            'items' => FriendResource::collection($result['items']),
            'meta' => $result['meta'],
        ]);
    }

    public function unfriend(Request $request, int $userId): JsonResponse
    {
        if ((int) $request->user()->id === $userId) {
            return $this->errorResponse('Invalid friend target.', [], 422);
        }

        try {
            $this->friendService->removeFriend($request->user(), $userId);
        } catch (\RuntimeException) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        return $this->successResponse('Friend removed successfully.', (object) []);
    }
}
