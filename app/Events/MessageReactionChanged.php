<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReactionChanged implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly int $conversationId,
        public readonly int $messageId,
        public readonly int $actorUserId,
        public readonly string $reactionCode,
        public readonly bool $added,
        public readonly array $summary,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('conversation.'.$this->conversationId);
    }

    public function broadcastAs(): string
    {
        return 'message.reaction.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'message_id' => $this->messageId,
            'actor_user_id' => $this->actorUserId,
            'reaction_code' => $this->reactionCode,
            'added' => $this->added,
            'summary' => $this->summary,
        ];
    }
}
