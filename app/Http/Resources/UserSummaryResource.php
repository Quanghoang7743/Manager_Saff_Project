<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'display_name' => $this->display_name,
            'username' => $this->username,
            'avatar_url' => $this->avatar_url,
            'presence_status' => $this->presence_status,
        ];
    }
}
