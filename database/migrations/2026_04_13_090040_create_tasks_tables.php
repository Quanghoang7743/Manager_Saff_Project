<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('creator_id');
            $table->unsignedBigInteger('assignee_id')->nullable();
            $table->string('priority', 20)->default('medium');
            $table->string('status', 30)->default('todo');
            $table->dateTime('due_at', 3)->nullable();
            $table->dateTime('completed_at', 3)->nullable();
            $table->dateTime('created_at', 3)->useCurrent();
            $table->dateTime('updated_at', 3)->useCurrent()->useCurrentOnUpdate();

            $table->index(['assignee_id', 'status']);
            $table->index(['creator_id', 'status']);
            $table->index('due_at');
        });

        Schema::create('task_comments', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('user_id');
            $table->text('content');
            $table->dateTime('created_at', 3)->useCurrent();
            $table->dateTime('updated_at', 3)->useCurrent()->useCurrentOnUpdate();

            $table->index('task_id');
            $table->index('user_id');
        });

        DB::statement("ALTER TABLE tasks ADD CONSTRAINT chk_tasks_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))");
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT chk_tasks_status CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled'))");
        DB::statement('ALTER TABLE tasks ADD CONSTRAINT fk_tasks_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE RESTRICT');
        DB::statement('ALTER TABLE tasks ADD CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL');
        DB::statement('ALTER TABLE task_comments ADD CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE task_comments ADD CONSTRAINT fk_task_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE task_comments DROP FOREIGN KEY fk_task_comments_task');
        DB::statement('ALTER TABLE task_comments DROP FOREIGN KEY fk_task_comments_user');
        DB::statement('ALTER TABLE tasks DROP FOREIGN KEY fk_tasks_creator');
        DB::statement('ALTER TABLE tasks DROP FOREIGN KEY fk_tasks_assignee');

        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('tasks');
    }
};
