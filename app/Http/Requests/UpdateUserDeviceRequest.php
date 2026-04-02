<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateUserDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = (int) $this->user()->id;
        $deviceId = (int) $this->route('id');

        return [
            'device_uuid' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('user_devices', 'device_uuid')
                    ->where(fn ($query) => $query->where('user_id', $userId))
                    ->ignore($deviceId),
            ],
            'device_type' => ['sometimes', 'required', 'in:ios,android,web,desktop'],
            'device_name' => ['nullable', 'string', 'max:100'],
            'push_token' => ['nullable', 'string', 'max:512'],
            'app_version' => ['nullable', 'string', 'max:50'],
            'os_version' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
            'touch_last_active' => ['nullable', 'boolean'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation error',
            'errors' => $validator->errors(),
        ], 422));
    }
}
