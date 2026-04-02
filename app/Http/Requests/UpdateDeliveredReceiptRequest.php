<?php

namespace App\Http\Requests;

class UpdateDeliveredReceiptRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'last_delivered_message_id' => ['nullable', 'integer', 'exists:messages,id'],
        ];
    }
}
