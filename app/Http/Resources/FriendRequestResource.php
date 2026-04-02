<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FriendRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'requester' => new UserSummaryResource($this->whenLoaded('requester', $this->requester)),
            'addressee' => new UserSummaryResource($this->whenLoaded('addressee', $this->addressee)),
            'phone_snapshot' => $this->phone_snapshot,
            'message' => $this->message,
            'status' => $this->status,
            'responded_at' => optional($this->responded_at)?->format('Y-m-d H:i:s.v'),
            'created_at' => optional($this->created_at)?->format('Y-m-d H:i:s.v'),
            'updated_at' => optional($this->updated_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
