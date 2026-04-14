<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100);
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('late_grace_minutes')->default(10);
            $table->unsignedSmallInteger('early_checkin_minutes')->default(30);
            $table->unsignedSmallInteger('break_minutes')->default(0);
            $table->boolean('is_overnight')->default(false);
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 3)->useCurrent();
            $table->dateTime('updated_at', 3)->useCurrent()->useCurrentOnUpdate();

            $table->index('is_active');
        });

        Schema::create('shift_assignments', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('shift_id');
            $table->date('work_date');
            $table->string('status', 20)->default('scheduled');
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->text('note')->nullable();
            $table->dateTime('created_at', 3)->useCurrent();
            $table->dateTime('updated_at', 3)->useCurrent()->useCurrentOnUpdate();

            $table->unique(['user_id', 'shift_id', 'work_date']);
            $table->index(['user_id', 'work_date']);
            $table->index(['status', 'work_date']);
        });

        Schema::create('attendance_logs', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('shift_assignment_id');
            $table->dateTime('check_in_at', 3)->nullable();
            $table->dateTime('check_out_at', 3)->nullable();
            $table->string('check_in_method', 30)->default('manual');
            $table->text('note')->nullable();
            $table->integer('work_minutes')->default(0);
            $table->integer('late_minutes')->default(0);
            $table->integer('early_leave_minutes')->default(0);
            $table->integer('overtime_minutes')->default(0);
            $table->dateTime('created_at', 3)->useCurrent();
            $table->dateTime('updated_at', 3)->useCurrent()->useCurrentOnUpdate();

            $table->unique('shift_assignment_id');
            $table->index(['user_id', 'check_in_at']);
        });

        Schema::create('attendance_adjustment_requests', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('attendance_log_id');
            $table->unsignedBigInteger('requester_id');
            $table->unsignedBigInteger('reviewer_id')->nullable();
            $table->string('status', 20)->default('pending');
            $table->text('reason');
            $table->dateTime('requested_check_in_at', 3)->nullable();
            $table->dateTime('requested_check_out_at', 3)->nullable();
            $table->text('review_note')->nullable();
            $table->dateTime('reviewed_at', 3)->nullable();
            $table->dateTime('created_at', 3)->useCurrent();
            $table->dateTime('updated_at', 3)->useCurrent()->useCurrentOnUpdate();

            $table->index(['requester_id', 'status']);
            $table->index('attendance_log_id');
        });

        DB::statement("ALTER TABLE shift_assignments ADD CONSTRAINT chk_shift_assignments_status CHECK (status IN ('scheduled', 'checked_in', 'checked_out', 'absent', 'incomplete'))");
        DB::statement("ALTER TABLE attendance_adjustment_requests ADD CONSTRAINT chk_adjustment_status CHECK (status IN ('pending', 'approved', 'rejected'))");

        DB::statement('ALTER TABLE shift_assignments ADD CONSTRAINT fk_shift_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE shift_assignments ADD CONSTRAINT fk_shift_assignments_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT');
        DB::statement('ALTER TABLE shift_assignments ADD CONSTRAINT fk_shift_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL');
        DB::statement('ALTER TABLE attendance_logs ADD CONSTRAINT fk_attendance_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE attendance_logs ADD CONSTRAINT fk_attendance_logs_assignment FOREIGN KEY (shift_assignment_id) REFERENCES shift_assignments(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE attendance_adjustment_requests ADD CONSTRAINT fk_adjustments_attendance_log FOREIGN KEY (attendance_log_id) REFERENCES attendance_logs(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE attendance_adjustment_requests ADD CONSTRAINT fk_adjustments_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE attendance_adjustment_requests ADD CONSTRAINT fk_adjustments_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE attendance_adjustment_requests DROP FOREIGN KEY fk_adjustments_attendance_log');
        DB::statement('ALTER TABLE attendance_adjustment_requests DROP FOREIGN KEY fk_adjustments_requester');
        DB::statement('ALTER TABLE attendance_adjustment_requests DROP FOREIGN KEY fk_adjustments_reviewer');
        DB::statement('ALTER TABLE attendance_logs DROP FOREIGN KEY fk_attendance_logs_user');
        DB::statement('ALTER TABLE attendance_logs DROP FOREIGN KEY fk_attendance_logs_assignment');
        DB::statement('ALTER TABLE shift_assignments DROP FOREIGN KEY fk_shift_assignments_user');
        DB::statement('ALTER TABLE shift_assignments DROP FOREIGN KEY fk_shift_assignments_shift');
        DB::statement('ALTER TABLE shift_assignments DROP FOREIGN KEY fk_shift_assignments_assigned_by');

        Schema::dropIfExists('attendance_adjustment_requests');
        Schema::dropIfExists('attendance_logs');
        Schema::dropIfExists('shift_assignments');
        Schema::dropIfExists('shifts');
    }
};
