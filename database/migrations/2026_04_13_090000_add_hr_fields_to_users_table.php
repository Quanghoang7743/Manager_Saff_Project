<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 30)->default('employee')->after('presence_status');
            $table->string('employee_code', 30)->nullable()->after('role');
            $table->unsignedBigInteger('department_id')->nullable()->after('employee_code');
            $table->unsignedBigInteger('position_id')->nullable()->after('department_id');
            $table->unsignedBigInteger('manager_user_id')->nullable()->after('position_id');
            $table->string('employment_status', 30)->default('active')->after('manager_user_id');
            $table->string('work_type', 20)->default('onsite')->after('employment_status');
            $table->date('hired_at')->nullable()->after('work_type');

            $table->unique('employee_code');
            $table->index('role');
            $table->index('department_id');
            $table->index('position_id');
            $table->index('manager_user_id');
            $table->index('employment_status');
        });

        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('super_admin', 'hr_admin', 'manager', 'employee'))");
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_employment_status CHECK (employment_status IN ('probation', 'active', 'leave', 'resigned'))");
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_work_type CHECK (work_type IN ('onsite', 'hybrid', 'remote'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP CHECK chk_users_role');
        DB::statement('ALTER TABLE users DROP CHECK chk_users_employment_status');
        DB::statement('ALTER TABLE users DROP CHECK chk_users_work_type');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['role']);
            $table->dropIndex(['department_id']);
            $table->dropIndex(['position_id']);
            $table->dropIndex(['manager_user_id']);
            $table->dropIndex(['employment_status']);
            $table->dropUnique(['employee_code']);

            $table->dropColumn([
                'role',
                'employee_code',
                'department_id',
                'position_id',
                'manager_user_id',
                'employment_status',
                'work_type',
                'hired_at',
            ]);
        });
    }
};
