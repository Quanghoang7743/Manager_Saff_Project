<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPrivacySetting extends Model
{
    protected $table = 'user_privacy_settings';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'allow_find_by_phone',
        'allow_friend_request',
        'auto_accept_contacts',
    ];

    protected $casts = [
        'allow_find_by_phone' => 'boolean',
        'allow_friend_request' => 'boolean',
        'auto_accept_contacts' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s.v',
        'updated_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
