<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationParticipant extends Model
{
    protected $table = 'conversation_participants';

    public $incrementing = false;

    protected $primaryKey = null;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'participant_role',
        'nickname',
        'left_at',
        'removed_at',
        'last_read_message_id',
        'last_read_at',
        'last_delivered_message_id',
        'last_delivered_at',
        'muted_until',
        'is_muted',
        'is_pinned',
        'is_archived',
        'is_hidden',
        'custom_conversation_name',
        'unread_count_cache',
    ];

    protected $casts = [
        'left_at' => 'datetime:Y-m-d H:i:s.v',
        'removed_at' => 'datetime:Y-m-d H:i:s.v',
        'last_read_at' => 'datetime:Y-m-d H:i:s.v',
        'last_delivered_at' => 'datetime:Y-m-d H:i:s.v',
        'muted_until' => 'datetime:Y-m-d H:i:s.v',
        'is_muted' => 'boolean',
        'is_pinned' => 'boolean',
        'is_archived' => 'boolean',
        'is_hidden' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s.v',
        'updated_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lastReadMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_read_message_id');
    }

    public function lastDeliveredMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_delivered_message_id');
    }
}
