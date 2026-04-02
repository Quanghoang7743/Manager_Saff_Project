<?php

namespace App\Http\Requests;

class StoreDirectConversationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'target_user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}
