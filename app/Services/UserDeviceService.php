<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserDevice;

class UserDeviceService
{
    public function registerOrUpdateDevice(User $user, array $payload): array
    {
        $device = $user->devices()->where('device_uuid', $payload['device_uuid'])->first();
        $created = false;

        if (! $device) {
            $created = true;
            $device = new UserDevice;
            $device->user_id = $user->id;
            $device->device_uuid = $payload['device_uuid'];
            $device->is_active = $payload['is_active'] ?? true;
        }

        $data = $this->extractMutableFields($payload);
        unset($data['device_uuid']);

        $device->fill($data);

        if (($payload['touch_last_active'] ?? false) === true) {
            $device->last_active_at = now();
        }

        $device->save();

        return [$device->fresh(), $created];
    }

    public function updateDevice(UserDevice $device, array $payload): UserDevice
    {
        $device->fill($this->extractMutableFields($payload));

        if (($payload['touch_last_active'] ?? false) === true) {
            $device->last_active_at = now();
        }

        $device->save();

        return $device->fresh();
    }

    private function extractMutableFields(array $payload): array
    {
        return collect($payload)
            ->only([
                'device_uuid',
                'device_type',
                'device_name',
                'push_token',
                'app_version',
                'os_version',
                'is_active',
            ])
            ->toArray();
    }
}
