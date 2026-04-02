<?php

namespace App\Events;

use App\Models\FriendRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestRejected implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly int $notifiedUserId,
        public readonly FriendRequest $request,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('user.'.$this->notifiedUserId);
    }

    public function broadcastAs(): string
    {
        return 'friend.request.rejected';
    }

    public function broadcastWith(): array
    {
        return [
            'friend_request_id' => $this->request->id,
            'requester_id' => $this->request->requester_id,
            'addressee_id' => $this->request->addressee_id,
            'status' => $this->request->status,
            'responded_at' => optional($this->request->responded_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
