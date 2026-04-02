<?php

namespace App\Services;

use App\Events\MessageReactionChanged;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\User;
use App\Support\BroadcastDispatcher;

class ReactionService
{
    public function ensureParticipant(Message $message, User $user): void
    {
        $isParticipant = ConversationParticipant::where('conversation_id', $message->conversation_id)
            ->where('user_id', $user->id)
            ->whereNull('left_at')
            ->whereNull('removed_at')
            ->exists();

        if (! $isParticipant) {
            throw new \DomainException('You do not have permission to access this resource');
        }
    }

    public function toggleReaction(Message $message, User $user, string $reactionCode): bool
    {
        $this->ensureParticipant($message, $user);

        $existing = MessageReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->where('reaction_code', $reactionCode)
            ->first();

        if ($existing) {
            $existing->delete();

            BroadcastDispatcher::dispatch(new MessageReactionChanged(
                conversationId: (int) $message->conversation_id,
                messageId: (int) $message->id,
                actorUserId: (int) $user->id,
                reactionCode: $reactionCode,
                added: false,
                summary: $this->buildSummary((int) $message->id),
            ));

            return false;
        }

        MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'reaction_code' => $reactionCode,
            'created_at' => now(),
        ]);

        BroadcastDispatcher::dispatch(new MessageReactionChanged(
            conversationId: (int) $message->conversation_id,
            messageId: (int) $message->id,
            actorUserId: (int) $user->id,
            reactionCode: $reactionCode,
            added: true,
            summary: $this->buildSummary((int) $message->id),
        ));

        return true;
    }

    public function removeReaction(Message $message, User $user, string $reactionCode): void
    {
        $this->ensureParticipant($message, $user);

        $deleted = MessageReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->where('reaction_code', $reactionCode)
            ->delete();

        if ($deleted > 0) {
            BroadcastDispatcher::dispatch(new MessageReactionChanged(
                conversationId: (int) $message->conversation_id,
                messageId: (int) $message->id,
                actorUserId: (int) $user->id,
                reactionCode: $reactionCode,
                added: false,
                summary: $this->buildSummary((int) $message->id),
            ));
        }
    }

    private function buildSummary(int $messageId): array
    {
        return MessageReaction::query()
            ->where('message_id', $messageId)
            ->selectRaw('reaction_code, COUNT(*) as total')
            ->groupBy('reaction_code')
            ->orderBy('reaction_code')
            ->get()
            ->map(fn ($row) => [
                'reaction_code' => $row->reaction_code,
                'total' => (int) $row->total,
            ])
            ->values()
            ->all();
    }
}
