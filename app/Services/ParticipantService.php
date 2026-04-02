<?php

namespace App\Services;

use App\Events\ConversationDeliveredUpdated;
use App\Events\ConversationReadUpdated;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use App\Support\BroadcastDispatcher;
use Illuminate\Support\Facades\DB;

class ParticipantService
{
    public function getActiveParticipant(Conversation $conversation, int $userId): ?ConversationParticipant
    {
        return ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $userId)
            ->whereNull('left_at')
            ->whereNull('removed_at')
            ->first();
    }

    public function isOwnerOrAdmin(Conversation $conversation, int $userId): bool
    {
        return ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $userId)
            ->whereIn('participant_role', ['owner', 'admin'])
            ->whereNull('left_at')
            ->whereNull('removed_at')
            ->exists();
    }

    public function isOwner(Conversation $conversation, int $userId): bool
    {
        return ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $userId)
            ->where('participant_role', 'owner')
            ->whereNull('left_at')
            ->whereNull('removed_at')
            ->exists();
    }

    public function addParticipants(Conversation $conversation, array $userIds): void
    {
        DB::transaction(function () use ($conversation, $userIds): void {
            foreach ($userIds as $userId) {
                ConversationParticipant::updateOrCreate(
                    [
                        'conversation_id' => $conversation->id,
                        'user_id' => $userId,
                    ],
                    [
                        'participant_role' => 'member',
                        'joined_at' => now(),
                        'left_at' => null,
                        'removed_at' => null,
                    ]
                );
            }
        });
    }

    public function removeParticipant(Conversation $conversation, int $userId): void
    {
        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $userId)
            ->update([
                'removed_at' => now(),
            ]);
    }

    public function updateRole(Conversation $conversation, int $userId, string $role): void
    {
        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $userId)
            ->update(['participant_role' => $role]);
    }

    public function updateRead(Conversation $conversation, User $user, ?int $messageId): ConversationParticipant
    {
        if ($messageId !== null) {
            $exists = Message::where('id', $messageId)->where('conversation_id', $conversation->id)->exists();
            if (! $exists) {
                throw new \DomainException('Invalid last_read_message_id');
            }
        }

        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update([
                'last_read_message_id' => $messageId,
                'last_read_at' => now(),
                'unread_count_cache' => 0,
            ]);

        $participant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        BroadcastDispatcher::dispatch(new ConversationReadUpdated(
            conversationId: (int) $conversation->id,
            userId: (int) $user->id,
            lastReadMessageId: $participant->last_read_message_id,
            lastReadAt: optional($participant->last_read_at)?->format('Y-m-d H:i:s.v'),
            unreadCountCache: (int) $participant->unread_count_cache,
        ));

        return $participant;
    }

    public function updateDelivered(Conversation $conversation, User $user, ?int $messageId): ConversationParticipant
    {
        if ($messageId !== null) {
            $exists = Message::where('id', $messageId)->where('conversation_id', $conversation->id)->exists();
            if (! $exists) {
                throw new \DomainException('Invalid last_delivered_message_id');
            }
        }

        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update([
                'last_delivered_message_id' => $messageId,
                'last_delivered_at' => now(),
            ]);

        $participant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        BroadcastDispatcher::dispatch(new ConversationDeliveredUpdated(
            conversationId: (int) $conversation->id,
            userId: (int) $user->id,
            lastDeliveredMessageId: $participant->last_delivered_message_id,
            lastDeliveredAt: optional($participant->last_delivered_at)?->format('Y-m-d H:i:s.v'),
        ));

        return $participant;
    }
}
