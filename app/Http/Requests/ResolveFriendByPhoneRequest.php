<?php

namespace App\Http\Requests;

class ResolveFriendByPhoneRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'phone_number' => ['required', 'string', 'max:20'],
        ];
    }
}
