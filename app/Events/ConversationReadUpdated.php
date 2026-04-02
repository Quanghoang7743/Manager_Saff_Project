<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationReadUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly int $conversationId,
        public readonly int $userId,
        public readonly ?int $lastReadMessageId,
        public readonly ?string $lastReadAt,
        public readonly int $unreadCountCache,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('conversation.'.$this->conversationId);
    }

    public function broadcastAs(): string
    {
        return 'conversation.read.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'user_id' => $this->userId,
            'last_read_message_id' => $this->lastReadMessageId,
            'last_read_at' => $this->lastReadAt,
            'unread_count_cache' => $this->unreadCountCache,
        ];
    }
}
