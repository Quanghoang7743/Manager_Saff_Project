<?php

namespace App\Http\Requests;

class UpdateConversationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'is_archived' => ['sometimes', 'boolean'],
            'is_encrypted' => ['sometimes', 'boolean'],
        ];
    }
}
