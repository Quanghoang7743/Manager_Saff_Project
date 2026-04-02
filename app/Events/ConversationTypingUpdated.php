<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationTypingUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly int $conversationId,
        public readonly int $userId,
        public readonly string $displayName,
        public readonly ?string $avatarUrl,
        public readonly bool $isTyping,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('conversation.'.$this->conversationId);
    }

    public function broadcastAs(): string
    {
        return 'conversation.typing.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'user' => [
                'id' => $this->userId,
                'display_name' => $this->displayName,
                'avatar_url' => $this->avatarUrl,
            ],
            'is_typing' => $this->isTyping,
        ];
    }
}
