<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'client_message_id',
        'message_type',
        'content',
        'content_json',
        'reply_to_message_id',
        'forward_from_message_id',
        'sent_at',
        'delivered_at',
        'edited_at',
        'deleted_for_everyone_at',
        'sender_deleted_at',
        'message_status',
        'has_attachments',
        'metadata_json',
    ];

    protected $casts = [
        'content_json' => 'array',
        'metadata_json' => 'array',
        'has_attachments' => 'boolean',
        'sent_at' => 'datetime:Y-m-d H:i:s.v',
        'delivered_at' => 'datetime:Y-m-d H:i:s.v',
        'edited_at' => 'datetime:Y-m-d H:i:s.v',
        'deleted_for_everyone_at' => 'datetime:Y-m-d H:i:s.v',
        'sender_deleted_at' => 'datetime:Y-m-d H:i:s.v',
        'created_at' => 'datetime:Y-m-d H:i:s.v',
        'updated_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function replyToMessage(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_message_id');
    }

    public function forwardFromMessage(): BelongsTo
    {
        return $this->belongsTo(self::class, 'forward_from_message_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class, 'message_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class, 'message_id');
    }
}
