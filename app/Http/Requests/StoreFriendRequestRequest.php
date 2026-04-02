<?php

namespace App\Http\Requests;

class StoreFriendRequestRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'target_user_id' => ['nullable', 'integer', 'exists:users,id', 'required_without:target_phone'],
            'target_phone' => ['nullable', 'string', 'max:20', 'required_without:target_user_id'],
            'message' => ['nullable', 'string', 'max:255'],
        ];
    }
}
