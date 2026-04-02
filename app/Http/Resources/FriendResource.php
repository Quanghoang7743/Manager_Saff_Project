<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FriendResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'friendship_id' => $this->resource['friendship_id'] ?? null,
            'friend' => new UserSummaryResource($this->resource['friend'] ?? null),
            'created_at' => $this->resource['created_at'] ?? null,
        ];
    }
}
