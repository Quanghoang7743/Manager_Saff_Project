<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('phone_number', 20)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('username', 50)->nullable();
            $table->string('display_name', 100);
            $table->string('password_hash', 255)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->string('bio', 255)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('account_status', 20)->default('active');
            $table->string('presence_status', 20)->default('offline');
            $table->dateTime('last_seen_at', 3)->nullable();
            $table->boolean('is_phone_verified')->default(false);
            $table->boolean('is_email_verified')->default(false);
            $table->dateTime('created_at', 3)->useCurrent();
            $table->dateTime('updated_at', 3)->useCurrent()->useCurrentOnUpdate();
            $table->dateTime('deleted_at', 3)->nullable();

            $table->unique('phone_number');
            $table->unique('email');
            $table->unique('username');

            $table->index('account_status');
            $table->index('presence_status');
            $table->index('last_seen_at');
            $table->index('deleted_at');
        });

        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_account_status CHECK (account_status IN ('active', 'suspended', 'deleted'))");
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_presence_status CHECK (presence_status IN ('online', 'offline', 'away', 'busy'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
