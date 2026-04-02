<?php

namespace App\Http\Requests;

class UpdateMessageRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'content' => ['sometimes', 'nullable', 'string'],
            'content_json' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
