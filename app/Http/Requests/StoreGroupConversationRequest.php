<?php

namespace App\Http\Requests;

class StoreGroupConversationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:500'],
            'owner_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'is_encrypted' => ['nullable', 'boolean'],
            'participant_ids' => ['nullable', 'array'],
            'participant_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ];
    }
}
