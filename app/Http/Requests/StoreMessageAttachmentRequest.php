<?php

namespace App\Http\Requests;

class StoreMessageAttachmentRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'attachment_type' => ['required', 'in:image,video,audio,file'],
            'file_name' => ['required', 'string', 'max:255'],
            'file_ext' => ['nullable', 'string', 'max:20'],
            'mime_type' => ['required', 'string', 'max:100'],
            'file_size' => ['required', 'integer', 'min:1'],
            'storage_provider' => ['required', 'in:s3,gcs,minio,local'],
            'storage_bucket' => ['nullable', 'string', 'max:100'],
            'storage_key' => ['required', 'string', 'max:500'],
            'file_url' => ['nullable', 'url', 'max:1000'],
            'thumbnail_url' => ['nullable', 'url', 'max:1000'],
            'checksum_sha256' => ['nullable', 'string', 'size:64'],
            'width' => ['nullable', 'integer', 'min:1'],
            'height' => ['nullable', 'integer', 'min:1'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'preview_text' => ['nullable', 'string', 'max:500'],
        ];
    }
}
