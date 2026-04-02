<?php

namespace App\Http\Requests;

class UpdateReadReceiptRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'last_read_message_id' => ['nullable', 'integer', 'exists:messages,id'],
        ];
    }
}
