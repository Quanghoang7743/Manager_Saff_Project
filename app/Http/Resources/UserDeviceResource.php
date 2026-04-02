<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserDeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'device_uuid' => $this->device_uuid,
            'device_type' => $this->device_type,
            'device_name' => $this->device_name,
            'push_token' => $this->push_token,
            'app_version' => $this->app_version,
            'os_version' => $this->os_version,
            'is_active' => $this->is_active,
            'last_active_at' => optional($this->last_active_at)?->format('Y-m-d H:i:s.v'),
            'created_at' => optional($this->created_at)?->format('Y-m-d H:i:s.v'),
            'updated_at' => optional($this->updated_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
