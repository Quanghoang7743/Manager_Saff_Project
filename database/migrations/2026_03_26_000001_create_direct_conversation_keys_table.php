<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE direct_conversation_keys (
  user_low_id BIGINT UNSIGNED NOT NULL,
  user_high_id BIGINT UNSIGNED NOT NULL,
  conversation_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_low_id, user_high_id),
  UNIQUE KEY uk_direct_conversation_id (conversation_id),
  CONSTRAINT fk_dck_user_low
    FOREIGN KEY (user_low_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dck_user_high
    FOREIGN KEY (user_high_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dck_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_dck_user_order CHECK (user_low_id < user_high_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('direct_conversation_keys');
    }
};
