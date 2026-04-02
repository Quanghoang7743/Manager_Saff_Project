<?php

namespace App\Http\Requests;

class UpdateTypingRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'is_typing' => ['nullable', 'boolean'],
        ];
    }
}
