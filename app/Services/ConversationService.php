<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\DirectConversationKey;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ConversationService
{
    public function listForUser(User $user, array $filters = [], int $perPage = 20)
    {
        return Conversation::query()
            ->join('conversation_participants as cp', 'cp.conversation_id', '=', 'conversations.id')
            ->where('cp.user_id', $user->id)
            ->whereNull('cp.left_at')
            ->whereNull('cp.removed_at')
            ->where('conversations.is_deleted', false)
            ->when(isset($filters['type']), fn ($q) => $q->where('conversations.conversation_type', $filters['type']))
            ->when(array_key_exists('archived', $filters), fn ($q) => $q->where('cp.is_archived', $filters['archived']))
            ->when(array_key_exists('pinned', $filters), fn ($q) => $q->where('cp.is_pinned', $filters['pinned']))
            ->when(array_key_exists('hidden', $filters), fn ($q) => $q->where('cp.is_hidden', $filters['hidden']))
            ->orderByDesc('cp.is_pinned')
            ->orderByDesc('conversations.last_message_at')
            ->orderByDesc('conversations.id')
            ->select('conversations.*')
            ->with(['creator', 'owner', 'lastMessage', 'participants.user'])
            ->paginate($perPage);
    }

    public function createDirect(User $authUser, int $targetUserId): array
    {
        if ($authUser->id === $targetUserId) {
            throw new \DomainException('Cannot create direct conversation with yourself');
        }

        [$low, $high] = [min($authUser->id, $targetUserId), max($authUser->id, $targetUserId)];

        $existing = DirectConversationKey::where('user_low_id', $low)
            ->where('user_high_id', $high)
            ->first();

        if ($existing) {
            return [$existing->conversation()->with(['creator', 'owner', 'lastMessage', 'participants.user'])->firstOrFail(), false];
        }

        $conversation = DB::transaction(function () use ($authUser, $targetUserId, $low, $high) {
            $conversation = Conversation::create([
                'conversation_type' => 'direct',
                'created_by' => $authUser->id,
                'owner_user_id' => null,
                'member_count' => 2,
                'is_encrypted' => false,
                'is_archived' => false,
                'is_deleted' => false,
            ]);

            ConversationParticipant::insert([
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $authUser->id,
                    'participant_role' => 'member',
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $targetUserId,
                    'participant_role' => 'member',
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            DirectConversationKey::create([
                'user_low_id' => $low,
                'user_high_id' => $high,
                'conversation_id' => $conversation->id,
                'created_at' => now(),
            ]);

            return $conversation;
        });

        return [$conversation->load(['creator', 'owner', 'lastMessage', 'participants.user']), true];
    }

    public function createGroup(User $authUser, array $payload): Conversation
    {
        return DB::transaction(function () use ($authUser, $payload) {
            $participantIds = collect($payload['participant_ids'] ?? [])->push($authUser->id)->unique()->values();

            $ownerUserId = isset($payload['owner_user_id']) && (int) $payload['owner_user_id'] === (int) $authUser->id
                ? $authUser->id
                : $authUser->id;

            $conversation = Conversation::create([
                'conversation_type' => 'group',
                'title' => $payload['title'],
                'avatar_url' => $payload['avatar_url'] ?? null,
                'description' => $payload['description'] ?? null,
                'created_by' => $authUser->id,
                'owner_user_id' => $ownerUserId,
                'member_count' => $participantIds->count(),
                'is_encrypted' => $payload['is_encrypted'] ?? false,
                'is_archived' => false,
                'is_deleted' => false,
            ]);

            $rows = $participantIds->map(function ($uid) use ($conversation, $authUser): array {
                return [
                    'conversation_id' => $conversation->id,
                    'user_id' => $uid,
                    'participant_role' => $uid == $authUser->id ? 'owner' : 'member',
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->all();

            ConversationParticipant::insert($rows);

            return $conversation;
        })->load(['creator', 'owner', 'lastMessage', 'participants.user']);
    }

    public function markDeleted(Conversation $conversation): void
    {
        $conversation->update(['is_deleted' => true]);
    }

    public function recalculateMemberCount(Conversation $conversation): void
    {
        $count = ConversationParticipant::where('conversation_id', $conversation->id)
            ->whereNull('left_at')
            ->whereNull('removed_at')
            ->count();

        $conversation->update(['member_count' => $count]);
    }
}
