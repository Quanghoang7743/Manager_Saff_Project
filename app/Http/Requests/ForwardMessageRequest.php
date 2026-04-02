<?php

namespace App\Http\Requests;

class ForwardMessageRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'conversation_id' => ['required', 'integer', 'exists:conversations,id'],
            'client_message_id' => ['nullable', 'string', 'max:100'],
            'content' => ['nullable', 'string'],
            'content_json' => ['nullable', 'array'],
        ];
    }
}
