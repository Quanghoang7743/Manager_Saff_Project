<?php

namespace App\Http\Requests;

class StoreUserRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'display_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'required_without:phone_number', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'required_without:email', 'string', 'max:20', 'unique:users,phone_number'],
            'username' => ['nullable', 'string', 'max:50', 'unique:users,username'],
            'password' => ['required', 'string', 'min:6'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'bio' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
        ];
    }
}
