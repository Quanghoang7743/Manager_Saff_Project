<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $table = 'conversations';

    protected $fillable = [
        'conversation_type',
        'title',
        'avatar_url',
        'created_by',
        'owner_user_id',
        'description',
        'last_message_id',
        'last_message_at',
        'member_count',
        'is_encrypted',
        'is_archived',
        'is_deleted',
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
        'is_archived' => 'boolean',
        'is_deleted' => 'boolean',
        'last_message_at' => 'datetime:Y-m-d H:i:s.v',
        'created_at' => 'datetime:Y-m-d H:i:s.v',
        'updated_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class, 'conversation_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants', 'conversation_id', 'user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    public function directConversationKey(): HasOne
    {
        return $this->hasOne(DirectConversationKey::class, 'conversation_id');
    }
}
