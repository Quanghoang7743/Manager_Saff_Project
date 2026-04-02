<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateUserRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = (int) $this->route('id');

        return [
            'display_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('users', 'phone_number')->ignore($userId)],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('users', 'username')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', 'nullable', 'string', 'max:20'],
            'presence_status' => ['sometimes', 'required', Rule::in(['online', 'offline', 'away', 'busy'])],
        ];
    }
}
