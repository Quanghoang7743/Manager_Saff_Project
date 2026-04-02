<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageReactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'message_id' => $this->message_id,
            'user' => new UserSummaryResource($this->whenLoaded('user', $this->user)),
            'reaction_code' => $this->reaction_code,
            'created_at' => optional($this->created_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
