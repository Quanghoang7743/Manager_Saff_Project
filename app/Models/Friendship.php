<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    protected $table = 'friendships';

    public $timestamps = false;

    protected $fillable = [
        'user_low_id',
        'user_high_id',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function lowUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_low_id');
    }

    public function highUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_high_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
