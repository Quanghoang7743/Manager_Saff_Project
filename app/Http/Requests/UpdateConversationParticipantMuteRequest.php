<?php

namespace App\Http\Requests;

class UpdateConversationParticipantMuteRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'muted_until' => ['nullable', 'date'],
        ];
    }
}
