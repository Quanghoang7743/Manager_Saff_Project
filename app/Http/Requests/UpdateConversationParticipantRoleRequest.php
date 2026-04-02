<?php

namespace App\Http\Requests;

class UpdateConversationParticipantRoleRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'participant_role' => ['required', 'in:owner,admin,member'],
        ];
    }
}
