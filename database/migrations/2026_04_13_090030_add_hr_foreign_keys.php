<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL');
        DB::statement('ALTER TABLE users ADD CONSTRAINT fk_users_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL');
        DB::statement('ALTER TABLE users ADD CONSTRAINT fk_users_manager FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL');
        DB::statement('ALTER TABLE departments ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE departments DROP FOREIGN KEY fk_departments_manager');
        DB::statement('ALTER TABLE users DROP FOREIGN KEY fk_users_department');
        DB::statement('ALTER TABLE users DROP FOREIGN KEY fk_users_position');
        DB::statement('ALTER TABLE users DROP FOREIGN KEY fk_users_manager');
    }
};
