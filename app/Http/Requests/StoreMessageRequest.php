<?php

namespace App\Http\Requests;

class StoreMessageRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'client_message_id' => ['nullable', 'string', 'max:100'],
            'message_type' => ['required', 'in:text,image,video,audio,file,sticker,system,call,location,contact'],
            'content' => ['nullable', 'string'],
            'content_json' => ['nullable', 'array'],
            'reply_to_message_id' => ['nullable', 'integer', 'exists:messages,id'],
            'forward_from_message_id' => ['nullable', 'integer', 'exists:messages,id'],
            'attachments' => ['nullable', 'array'],
            'attachments.*.attachment_type' => ['required', 'in:image,video,audio,file'],
            'attachments.*.file_name' => ['required', 'string', 'max:255'],
            'attachments.*.file_ext' => ['nullable', 'string', 'max:20'],
            'attachments.*.mime_type' => ['required', 'string', 'max:100'],
            'attachments.*.file_size' => ['required', 'integer', 'min:1'],
            'attachments.*.storage_provider' => ['required', 'in:s3,gcs,minio,local'],
            'attachments.*.storage_bucket' => ['nullable', 'string', 'max:100'],
            'attachments.*.storage_key' => ['required', 'string', 'max:500'],
            'attachments.*.file_url' => ['nullable', 'url', 'max:1000'],
            'attachments.*.thumbnail_url' => ['nullable', 'url', 'max:1000'],
            'attachments.*.checksum_sha256' => ['nullable', 'string', 'size:64'],
            'attachments.*.width' => ['nullable', 'integer', 'min:1'],
            'attachments.*.height' => ['nullable', 'integer', 'min:1'],
            'attachments.*.duration_seconds' => ['nullable', 'integer', 'min:0'],
            'attachments.*.preview_text' => ['nullable', 'string', 'max:500'],
        ];
    }
}
