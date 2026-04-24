<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shift_assignment_id',
        'check_in_at',
        'check_out_at',
        'check_in_method',
        'note',
        'work_minutes',
        'late_minutes',
        'early_leave_minutes',
        'overtime_minutes',
    ];

    protected $casts = [
        'check_in_at' => 'datetime:Y-m-d H:i:s.v',
        'check_out_at' => 'datetime:Y-m-d H:i:s.v',
        'created_at' => 'datetime:Y-m-d H:i:s.v',
        'updated_at' => 'datetime:Y-m-d H:i:s.v',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ShiftAssignment::class, 'shift_assignment_id');
    }

    public function adjustmentRequests(): HasMany
    {
        return $this->hasMany(AttendanceAdjustmentRequest::class, 'attendance_log_id');
    }
}
