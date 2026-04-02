<?php

namespace App\Events;

use App\Models\Friendship;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestAccepted implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly int $notifiedUserId,
        public readonly int $friendUserId,
        public readonly Friendship $friendship,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('user.'.$this->notifiedUserId);
    }

    public function broadcastAs(): string
    {
        return 'friend.request.accepted';
    }

    public function broadcastWith(): array
    {
        return [
            'friend_user_id' => $this->friendUserId,
            'friendship_id' => $this->friendship->id,
            'created_at' => optional($this->friendship->created_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
