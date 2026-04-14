<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'phone_number' => $this->phone_number,
            'email' => $this->email,
            'username' => $this->username,
            'display_name' => $this->display_name,
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'birth_date' => optional($this->birth_date)->format('Y-m-d'),
            'gender' => $this->gender,
            'account_status' => $this->account_status,
            'presence_status' => $this->presence_status,
            'role' => $this->role,
            'employee_code' => $this->employee_code,
            'department_id' => $this->department_id,
            'position_id' => $this->position_id,
            'manager_user_id' => $this->manager_user_id,
            'employment_status' => $this->employment_status,
            'work_type' => $this->work_type,
            'hired_at' => optional($this->hired_at)?->format('Y-m-d'),
            'last_seen_at' => optional($this->last_seen_at)?->format('Y-m-d H:i:s.v'),
            'is_phone_verified' => $this->is_phone_verified,
            'is_email_verified' => $this->is_email_verified,
            'created_at' => optional($this->created_at)?->format('Y-m-d H:i:s.v'),
            'updated_at' => optional($this->updated_at)?->format('Y-m-d H:i:s.v'),
            'deleted_at' => optional($this->deleted_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
