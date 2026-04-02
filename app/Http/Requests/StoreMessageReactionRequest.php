<?php

namespace App\Http\Requests;

class StoreMessageReactionRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'reaction_code' => ['required', 'string', 'max:20'],
        ];
    }
}
