<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRemoved implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly int $notifiedUserId,
        public readonly int $friendUserId,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('user.'.$this->notifiedUserId);
    }

    public function broadcastAs(): string
    {
        return 'friend.removed';
    }

    public function broadcastWith(): array
    {
        return [
            'friend_user_id' => $this->friendUserId,
        ];
    }
}
