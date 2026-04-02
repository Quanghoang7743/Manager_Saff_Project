<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'phone_number',
        'email',
        'username',
        'display_name',
        'password_hash',
        'avatar_url',
        'bio',
        'birth_date',
        'gender',
        'account_status',
        'presence_status',
        'last_seen_at',
        'is_phone_verified',
        'is_email_verified',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'last_seen_at' => 'datetime:Y-m-d H:i:s.v',
        'is_phone_verified' => 'boolean',
        'is_email_verified' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s.v',
        'updated_at' => 'datetime:Y-m-d H:i:s.v',
        'deleted_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function devices(): HasMany
    {
        return $this->hasMany(UserDevice::class, 'user_id');
    }

    public function createdConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'created_by');
    }

    public function ownedConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'owner_user_id');
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants', 'user_id', 'conversation_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function reactedMessages(): BelongsToMany
    {
        return $this->belongsToMany(Message::class, 'message_reactions', 'user_id', 'message_id')->withPivot('reaction_code');
    }

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'requester_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'addressee_id');
    }

    public function privacySetting(): HasOne
    {
        return $this->hasOne(UserPrivacySetting::class, 'user_id');
    }

    public function blocksInitiated(): HasMany
    {
        return $this->hasMany(UserBlock::class, 'blocker_id');
    }

    public function blocksReceived(): HasMany
    {
        return $this->hasMany(UserBlock::class, 'blocked_id');
    }

    public function friendshipsAsLow(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_low_id');
    }

    public function friendshipsAsHigh(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_high_id');
    }
}
