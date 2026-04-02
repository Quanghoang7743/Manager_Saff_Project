<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE user_blocks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  blocker_id BIGINT UNSIGNED NOT NULL,
  blocked_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_blocks_pair (blocker_id, blocked_id),
  KEY idx_user_blocks_blocked (blocked_id),
  CONSTRAINT fk_user_blocks_blocker
    FOREIGN KEY (blocker_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_blocks_blocked
    FOREIGN KEY (blocked_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('user_blocks');
    }
};
