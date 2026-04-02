<?php

namespace App\Services;

use App\Events\MessageCreated;
use App\Events\MessageDeletedForEveryone;
use App\Events\MessageUpdated;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Support\BroadcastDispatcher;
use Illuminate\Support\Facades\DB;

class MessageService
{
    private const EDITABLE_TYPES = ['text', 'image', 'video', 'audio', 'file', 'location', 'contact'];

    public function listForConversation(Conversation $conversation, User $user, ?int $cursorId = null, int $limit = 30)
    {
        $this->ensureActiveParticipant($conversation, $user);

        return Message::query()
            ->where('conversation_id', $conversation->id)
            ->whereNull('deleted_for_everyone_at')
            ->when($cursorId !== null, fn ($q) => $q->where('id', '<', $cursorId))
            ->with(['sender', 'attachments', 'reactions.user'])
            ->withCount('reactions')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    public function sendMessage(Conversation $conversation, User $user, array $payload): Message
    {
        $this->ensureActiveParticipant($conversation, $user);

        if (! empty($payload['client_message_id'])) {
            $existing = Message::where('sender_id', $user->id)
                ->where('client_message_id', $payload['client_message_id'])
                ->with(['sender', 'attachments', 'reactions.user'])
                ->withCount('reactions')
                ->first();

            if ($existing) {
                return $existing;
            }
        }

        $message = DB::transaction(function () use ($conversation, $user, $payload) {
            $replyId = $payload['reply_to_message_id'] ?? null;
            if ($replyId !== null) {
                $isSameConversation = Message::where('id', $replyId)
                    ->where('conversation_id', $conversation->id)
                    ->exists();

                if (! $isSameConversation) {
                    throw new \DomainException('reply_to_message_id must belong to same conversation');
                }
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'client_message_id' => $payload['client_message_id'] ?? null,
                'message_type' => $payload['message_type'],
                'content' => $payload['content'] ?? null,
                'content_json' => $payload['content_json'] ?? null,
                'reply_to_message_id' => $replyId,
                'forward_from_message_id' => $payload['forward_from_message_id'] ?? null,
                'sent_at' => now(),
                'message_status' => 'sent',
                'has_attachments' => ! empty($payload['attachments']),
            ]);

            if (! empty($payload['attachments'])) {
                $attachments = collect($payload['attachments'])->map(function (array $row) use ($message): array {
                    $row['message_id'] = $message->id;
                    $row['created_at'] = now();

                    return $row;
                })->all();

                MessageAttachment::insert($attachments);
            }

            $conversation->update([
                'last_message_id' => $message->id,
                'last_message_at' => $message->sent_at,
            ]);

            ConversationParticipant::where('conversation_id', $conversation->id)
                ->where('user_id', '!=', $user->id)
                ->whereNull('left_at')
                ->whereNull('removed_at')
                ->increment('unread_count_cache');

            return $message->load(['sender', 'attachments', 'reactions.user'])->loadCount('reactions');
        });

        BroadcastDispatcher::dispatch(new MessageCreated($message));

        return $message;
    }

    public function updateMessage(Message $message, User $user, array $payload): Message
    {
        if ((int) $message->sender_id !== (int) $user->id) {
            throw new \DomainException('Only sender can edit this message');
        }

        if (! in_array($message->message_type, self::EDITABLE_TYPES, true)) {
            throw new \DomainException('Message type is not editable');
        }

        $message->fill([
            'content' => $payload['content'] ?? $message->content,
            'content_json' => $payload['content_json'] ?? $message->content_json,
            'edited_at' => now(),
        ]);
        $message->save();

        $message = $message->fresh(['sender', 'attachments', 'reactions.user'])->loadCount('reactions');
        BroadcastDispatcher::dispatch(new MessageUpdated($message));

        return $message;
    }

    public function deleteForSender(Message $message, User $user): void
    {
        if ((int) $message->sender_id === (int) $user->id) {
            $message->update(['sender_deleted_at' => now()]);
        }
    }

    public function deleteForEveryone(Message $message, User $user): void
    {
        if ((int) $message->sender_id !== (int) $user->id) {
            throw new \DomainException('Only sender can delete for everyone');
        }

        $message->update([
            'deleted_for_everyone_at' => now(),
            'content' => null,
            'content_json' => null,
            'metadata_json' => null,
        ]);

        $message = $message->fresh(['attachments']);
        BroadcastDispatcher::dispatch(new MessageDeletedForEveryone($message));
    }

    public function forwardMessage(Message $source, User $user, array $payload): Message
    {
        $targetConversation = Conversation::findOrFail((int) $payload['conversation_id']);

        return $this->sendMessage($targetConversation, $user, [
            'client_message_id' => $payload['client_message_id'] ?? null,
            'message_type' => $source->message_type,
            'content' => $payload['content'] ?? $source->content,
            'content_json' => $payload['content_json'] ?? $source->content_json,
            'forward_from_message_id' => $source->id,
            'attachments' => [],
        ]);
    }

    public function addAttachment(Message $message, User $user, array $payload): MessageAttachment
    {
        $conversation = $message->conversation;
        $this->ensureActiveParticipant($conversation, $user);

        $attachment = MessageAttachment::create(array_merge($payload, [
            'message_id' => $message->id,
            'created_at' => now(),
        ]));

        if (! $message->has_attachments) {
            $message->update(['has_attachments' => true]);
        }

        $message = $message->fresh(['sender', 'attachments', 'reactions.user'])->loadCount('reactions');
        BroadcastDispatcher::dispatch(new MessageUpdated($message));

        return $attachment;
    }

    public function removeAttachment(MessageAttachment $attachment, User $user): void
    {
        $message = $attachment->message;
        $conversation = $message->conversation;
        $this->ensureActiveParticipant($conversation, $user);

        $attachment->delete();

        $remaining = MessageAttachment::where('message_id', $message->id)->exists();
        if (! $remaining && $message->has_attachments) {
            $message->update(['has_attachments' => false]);
        }

        $message = $message->fresh(['sender', 'attachments', 'reactions.user'])->loadCount('reactions');
        BroadcastDispatcher::dispatch(new MessageUpdated($message));
    }

    private function ensureActiveParticipant(Conversation $conversation, User $user): void
    {
        $isActive = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('left_at')
            ->whereNull('removed_at')
            ->exists();

        if (! $isActive) {
            throw new \DomainException('You do not have permission to access this resource');
        }
    }
}
