<?php

namespace App\Http\Requests;

class LoginRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['nullable', 'required_without:phone_number', 'email', 'max:255'],
            'phone_number' => ['nullable', 'required_without:email', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6'],
        ];
    }
}
