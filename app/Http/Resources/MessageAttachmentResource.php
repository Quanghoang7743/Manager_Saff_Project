<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'attachment_type' => $this->attachment_type,
            'file_name' => $this->file_name,
            'file_ext' => $this->file_ext,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'storage_provider' => $this->storage_provider,
            'storage_bucket' => $this->storage_bucket,
            'storage_key' => $this->storage_key,
            'file_url' => $this->file_url,
            'thumbnail_url' => $this->thumbnail_url,
            'checksum_sha256' => $this->checksum_sha256,
            'width' => $this->width,
            'height' => $this->height,
            'duration_seconds' => $this->duration_seconds,
            'preview_text' => $this->preview_text,
            'created_at' => optional($this->created_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
