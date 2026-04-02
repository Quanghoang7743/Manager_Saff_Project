<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function searchForUser(User $authUser, string $query, int $perPage = 20): LengthAwarePaginator
    {
        $term = trim($query);

        return User::query()
            ->where('account_status', 'active')
            ->where('id', '!=', $authUser->id)
            ->where(function ($builder) use ($term): void {
                $builder
                    ->where('display_name', 'like', '%'.$term.'%')
                    ->orWhere('username', 'like', '%'.$term.'%')
                    ->orWhere('phone_number', 'like', '%'.$term.'%')
                    ->orWhere('email', 'like', '%'.$term.'%');
            })
            ->orderBy('display_name')
            ->orderBy('id')
            ->paginate($perPage);
    }

    public function update(User $user, array $payload): User
    {
        if (! empty($payload['password'])) {
            $payload['password_hash'] = Hash::make($payload['password']);
        }

        unset($payload['password'], $payload['account_status'], $payload['is_phone_verified'], $payload['is_email_verified']);

        $user->fill($payload);
        $user->save();

        return $user->refresh();
    }

    public function softDelete(User $user): void
    {
        $user->forceFill([
            'account_status' => 'deleted',
        ])->save();

        $user->tokens()->delete();
        $user->delete();
    }
}
