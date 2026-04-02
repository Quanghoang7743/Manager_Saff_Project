<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageAttachment extends Model
{
    protected $table = 'message_attachments';

    public $timestamps = false;

    protected $fillable = [
        'message_id',
        'attachment_type',
        'file_name',
        'file_ext',
        'mime_type',
        'file_size',
        'storage_provider',
        'storage_bucket',
        'storage_key',
        'file_url',
        'thumbnail_url',
        'checksum_sha256',
        'width',
        'height',
        'duration_seconds',
        'preview_text',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
