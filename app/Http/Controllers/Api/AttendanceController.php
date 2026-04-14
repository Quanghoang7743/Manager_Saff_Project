<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceAdjustmentRequest;
use App\Models\AttendanceLog;
use App\Models\Shift;
use App\Models\ShiftAssignment;
use App\Models\User;
use App\Support\RoleGuard;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    use ApiResponseTrait;

    public function shifts(Request $request): JsonResponse
    {
        $items = Shift::query()->orderBy('name')->get();

        return $this->successResponse('Shifts fetched.', $items);
    }

    public function createShift(Request $request): JsonResponse
    {
        if (! RoleGuard::canManageAttendance($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'start_time' => ['required', 'date_format:H:i:s'],
            'end_time' => ['required', 'date_format:H:i:s'],
            'late_grace_minutes' => ['nullable', 'integer', 'min:0', 'max:180'],
            'early_checkin_minutes' => ['nullable', 'integer', 'min:0', 'max:180'],
            'break_minutes' => ['nullable', 'integer', 'min:0', 'max:600'],
            'is_overnight' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $shift = Shift::create([
            ...$validated,
            'late_grace_minutes' => $validated['late_grace_minutes'] ?? 10,
            'early_checkin_minutes' => $validated['early_checkin_minutes'] ?? 30,
            'break_minutes' => $validated['break_minutes'] ?? 0,
            'is_overnight' => $validated['is_overnight'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return $this->successResponse('Shift created.', $shift, 201);
    }

    public function updateShift(Request $request, int $id): JsonResponse
    {
        if (! RoleGuard::canManageAttendance($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $shift = Shift::find($id);
        if (! $shift) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'start_time' => ['sometimes', 'required', 'date_format:H:i:s'],
            'end_time' => ['sometimes', 'required', 'date_format:H:i:s'],
            'late_grace_minutes' => ['sometimes', 'integer', 'min:0', 'max:180'],
            'early_checkin_minutes' => ['sometimes', 'integer', 'min:0', 'max:180'],
            'break_minutes' => ['sometimes', 'integer', 'min:0', 'max:600'],
            'is_overnight' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $shift->fill($validated)->save();

        return $this->successResponse('Shift updated.', $shift->fresh());
    }

    public function deleteShift(Request $request, int $id): JsonResponse
    {
        if (! RoleGuard::canManageAttendance($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $shift = Shift::find($id);
        if (! $shift) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $shift->delete();

        return $this->successResponse('Shift deleted.', (object) []);
    }

    public function assignShift(Request $request): JsonResponse
    {
        $auth = $request->user();
        if (! RoleGuard::canManageEmployees($auth)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'shift_id' => ['required', 'integer', 'exists:shifts,id'],
            'work_date' => ['required', 'date'],
            'note' => ['nullable', 'string'],
        ]);

        if ($auth->hasRole('manager')) {
            $target = User::findOrFail((int) $validated['user_id']);
            if ((int) $target->manager_user_id !== (int) $auth->id) {
                return $this->errorResponse('Managers can only assign shifts to their team members.', [], 403);
            }
        }

        $assignment = ShiftAssignment::updateOrCreate(
            [
                'user_id' => $validated['user_id'],
                'shift_id' => $validated['shift_id'],
                'work_date' => $validated['work_date'],
            ],
            [
                'status' => 'scheduled',
                'assigned_by' => $auth->id,
                'note' => $validated['note'] ?? null,
            ]
        );

        return $this->successResponse('Shift assigned.', $assignment->load(['user:id,display_name,username,avatar_url', 'shift']));
    }

    public function myAssignments(Request $request): JsonResponse
    {
        $query = ShiftAssignment::query()
            ->where('user_id', $request->user()->id)
            ->with(['shift', 'log'])
            ->orderByDesc('work_date');

        if ($request->filled('from')) {
            $query->whereDate('work_date', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('work_date', '<=', $request->query('to'));
        }

        return $this->successResponse('Assignments fetched.', $query->limit(90)->get());
    }

    public function checkIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shift_assignment_id' => ['required', 'integer', 'exists:shift_assignments,id'],
            'check_in_method' => ['nullable', 'string', 'max:30'],
            'note' => ['nullable', 'string'],
        ]);

        $auth = $request->user();
        $assignment = ShiftAssignment::with('shift')->findOrFail((int) $validated['shift_assignment_id']);
        if ((int) $assignment->user_id !== (int) $auth->id) {
            return $this->errorResponse('You can only check in your own shift.', [], 403);
        }

        $existingOpen = AttendanceLog::query()
            ->where('user_id', $auth->id)
            ->whereNull('check_out_at')
            ->where('shift_assignment_id', '!=', $assignment->id)
            ->exists();
        if ($existingOpen) {
            return $this->errorResponse('You already have an active shift without check-out.', [], 422);
        }

        [$startAt] = $this->shiftWindow($assignment);
        $now = now();
        $allowedEarly = (int) ($assignment->shift->early_checkin_minutes ?? 30);
        if ($now->lt($startAt->copy()->subMinutes($allowedEarly))) {
            return $this->errorResponse('Too early to check in for this shift.', [], 422);
        }

        $lateMinutes = max(0, $startAt->diffInMinutes($now, false));
        $lateMinutes = $lateMinutes > 0 ? max(0, $lateMinutes - (int) ($assignment->shift->late_grace_minutes ?? 10)) : 0;

        $log = DB::transaction(function () use ($assignment, $validated, $auth, $lateMinutes, $now) {
            $log = AttendanceLog::updateOrCreate(
                ['shift_assignment_id' => $assignment->id],
                [
                    'user_id' => $auth->id,
                    'check_in_at' => $now,
                    'check_in_method' => $validated['check_in_method'] ?? 'manual',
                    'note' => $validated['note'] ?? null,
                    'late_minutes' => $lateMinutes,
                ]
            );

            $assignment->status = 'checked_in';
            $assignment->save();

            return $log;
        });

        return $this->successResponse('Checked in successfully.', $log->fresh(['assignment.shift']));
    }

    public function checkOut(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shift_assignment_id' => ['required', 'integer', 'exists:shift_assignments,id'],
            'note' => ['nullable', 'string'],
        ]);

        $auth = $request->user();
        $assignment = ShiftAssignment::with(['shift', 'log'])->findOrFail((int) $validated['shift_assignment_id']);
        if ((int) $assignment->user_id !== (int) $auth->id) {
            return $this->errorResponse('You can only check out your own shift.', [], 403);
        }

        $log = $assignment->log;
        if (! $log || ! $log->check_in_at) {
            return $this->errorResponse('Cannot check out before check in.', [], 422);
        }
        if ($log->check_out_at) {
            return $this->errorResponse('This shift has already been checked out.', [], 422);
        }

        [$startAt, $endAt] = $this->shiftWindow($assignment);
        $now = now();

        $workMinutes = max(0, $log->check_in_at->diffInMinutes($now));
        $workMinutes = max(0, $workMinutes - (int) ($assignment->shift->break_minutes ?? 0));
        $earlyLeaveMinutes = max(0, $now->lt($endAt) ? $now->diffInMinutes($endAt) : 0);
        $overtimeMinutes = max(0, $now->gt($endAt) ? $endAt->diffInMinutes($now) : 0);

        DB::transaction(function () use ($assignment, $log, $validated, $now, $workMinutes, $earlyLeaveMinutes, $overtimeMinutes) {
            $log->fill([
                'check_out_at' => $now,
                'note' => $validated['note'] ?? $log->note,
                'work_minutes' => $workMinutes,
                'early_leave_minutes' => $earlyLeaveMinutes,
                'overtime_minutes' => $overtimeMinutes,
            ])->save();

            $assignment->status = 'checked_out';
            $assignment->save();
        });

        return $this->successResponse('Checked out successfully.', $log->fresh(['assignment.shift']));
    }

    public function myLogs(Request $request): JsonResponse
    {
        $query = AttendanceLog::query()
            ->where('user_id', $request->user()->id)
            ->with(['assignment.shift'])
            ->orderByDesc('id');

        if ($request->filled('from')) {
            $query->whereDate('check_in_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('check_in_at', '<=', $request->query('to'));
        }

        return $this->successResponse('Attendance logs fetched.', $query->limit(120)->get());
    }

    public function teamLogs(Request $request): JsonResponse
    {
        $auth = $request->user();
        if (! $auth->hasRole(['super_admin', 'hr_admin', 'manager'])) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $query = AttendanceLog::query()
            ->with(['user:id,display_name,username,avatar_url,manager_user_id', 'assignment.shift'])
            ->orderByDesc('id');

        if ($auth->hasRole('manager')) {
            $query->whereHas('user', fn ($builder) => $builder->where('manager_user_id', $auth->id));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->query('user_id'));
        }
        if ($request->filled('from')) {
            $query->whereDate('check_in_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('check_in_at', '<=', $request->query('to'));
        }

        return $this->successResponse('Team attendance logs fetched.', $query->limit(300)->get());
    }

    public function report(Request $request): JsonResponse
    {
        $auth = $request->user();
        if (! $auth->hasRole(['super_admin', 'hr_admin', 'manager'])) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $from = $request->query('from', now()->startOfMonth()->toDateString());
        $to = $request->query('to', now()->endOfMonth()->toDateString());

        $query = AttendanceLog::query()
            ->whereDate('check_in_at', '>=', $from)
            ->whereDate('check_in_at', '<=', $to)
            ->with('user:id,display_name,username,manager_user_id');

        if ($auth->hasRole('manager')) {
            $query->whereHas('user', fn ($builder) => $builder->where('manager_user_id', $auth->id));
        }

        $rows = $query->get();

        $summary = $rows->groupBy('user_id')->map(function ($items) {
            $user = $items->first()?->user;

            return [
                'user_id' => $user?->id,
                'display_name' => $user?->display_name,
                'work_days' => $items->filter(fn ($row) => $row->check_in_at && $row->check_out_at)->count(),
                'late_days' => $items->filter(fn ($row) => (int) $row->late_minutes > 0)->count(),
                'total_work_minutes' => (int) $items->sum('work_minutes'),
                'total_overtime_minutes' => (int) $items->sum('overtime_minutes'),
            ];
        })->values();

        return $this->successResponse('Attendance report fetched.', [
            'from' => $from,
            'to' => $to,
            'summary' => $summary,
        ]);
    }

    public function requestAdjustment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'attendance_log_id' => ['required', 'integer', 'exists:attendance_logs,id'],
            'reason' => ['required', 'string'],
            'requested_check_in_at' => ['nullable', 'date'],
            'requested_check_out_at' => ['nullable', 'date'],
        ]);

        $auth = $request->user();
        $log = AttendanceLog::findOrFail((int) $validated['attendance_log_id']);
        if ((int) $log->user_id !== (int) $auth->id) {
            return $this->errorResponse('You can only request adjustment for your own log.', [], 403);
        }

        $adjustment = AttendanceAdjustmentRequest::create([
            'attendance_log_id' => $log->id,
            'requester_id' => $auth->id,
            'status' => 'pending',
            'reason' => $validated['reason'],
            'requested_check_in_at' => $validated['requested_check_in_at'] ?? null,
            'requested_check_out_at' => $validated['requested_check_out_at'] ?? null,
        ]);

        return $this->successResponse('Adjustment request created.', $adjustment, 201);
    }

    public function reviewAdjustment(Request $request, int $id): JsonResponse
    {
        if (! RoleGuard::canManageAttendance($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $adjustment = AttendanceAdjustmentRequest::with('attendanceLog')->find($id);
        if (! $adjustment) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'review_note' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($adjustment, $validated, $request): void {
            $adjustment->fill([
                'status' => $validated['status'],
                'review_note' => $validated['review_note'] ?? null,
                'reviewer_id' => $request->user()->id,
                'reviewed_at' => now(),
            ])->save();

            if ($validated['status'] !== 'approved') {
                return;
            }

            $log = $adjustment->attendanceLog;
            if (! $log) {
                return;
            }

            if ($adjustment->requested_check_in_at) {
                $log->check_in_at = $adjustment->requested_check_in_at;
            }
            if ($adjustment->requested_check_out_at) {
                $log->check_out_at = $adjustment->requested_check_out_at;
            }
            $log->save();
        });

        return $this->successResponse('Adjustment reviewed.', $adjustment->fresh());
    }

    private function shiftWindow(ShiftAssignment $assignment): array
    {
        $date = Carbon::parse($assignment->work_date)->toDateString();
        $startAt = Carbon::parse($date.' '.$assignment->shift->start_time);
        $endAt = Carbon::parse($date.' '.$assignment->shift->end_time);

        if ($assignment->shift->is_overnight || $endAt->lte($startAt)) {
            $endAt->addDay();
        }

        return [$startAt, $endAt];
    }
}
