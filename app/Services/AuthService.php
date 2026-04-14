<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPrivacySetting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $payload): User
    {
        $user = User::create([
            'display_name' => $payload['display_name'],
            'email' => $payload['email'] ?? null,
            'phone_number' => $payload['phone_number'] ?? null,
            'username' => $payload['username'] ?? null,
            'password_hash' => Hash::make($payload['password']),
            'avatar_url' => $payload['avatar_url'] ?? null,
            'bio' => $payload['bio'] ?? null,
            'birth_date' => $payload['birth_date'] ?? null,
            'gender' => $payload['gender'] ?? null,
            'account_status' => 'active',
            'presence_status' => 'offline',
            'role' => 'employee',
            'employment_status' => 'active',
            'work_type' => 'onsite',
            'is_phone_verified' => false,
            'is_email_verified' => false,
        ]);

        UserPrivacySetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'allow_find_by_phone' => true,
                'allow_friend_request' => true,
                'auto_accept_contacts' => false,
            ]
        );

        return $user;
    }

    public function login(array $payload): array
    {
        $queryField = ! empty($payload['email']) ? 'email' : 'phone_number';
        $queryValue = $payload[$queryField];

        $user = User::withTrashed()->where($queryField, $queryValue)->first();

        if (! $user || ! Hash::check($payload['password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'credentials' => ['Invalid credentials.'],
            ]);
        }

        if ($user->trashed() || in_array($user->account_status, ['suspended', 'deleted'], true)) {
            throw ValidationException::withMessages([
                'account_status' => ['This account is not allowed to log in.'],
            ]);
        }

        $user->forceFill([
            'last_seen_at' => now(),
        ])->save();

        return [
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
