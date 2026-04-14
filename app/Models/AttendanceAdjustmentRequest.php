<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceAdjustmentRequest extends Model
{
    use HasFactory;

    protected $table = 'attendance_adjustment_requests';

    protected $fillable = [
        'attendance_log_id',
        'requester_id',
        'reviewer_id',
        'status',
        'reason',
        'requested_check_in_at',
        'requested_check_out_at',
        'review_note',
        'reviewed_at',
    ];

    protected $casts = [
        'requested_check_in_at' => 'datetime:Y-m-d H:i:s.v',
        'requested_check_out_at' => 'datetime:Y-m-d H:i:s.v',
        'reviewed_at' => 'datetime:Y-m-d H:i:s.v',
        'created_at' => 'datetime:Y-m-d H:i:s.v',
        'updated_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function attendanceLog(): BelongsTo
    {
        return $this->belongsTo(AttendanceLog::class, 'attendance_log_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
