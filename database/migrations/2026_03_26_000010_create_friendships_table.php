<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE friendships (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_low_id BIGINT UNSIGNED NOT NULL,
  user_high_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_friendships_pair (user_low_id, user_high_id),
  KEY idx_friendships_user_high (user_high_id),
  CONSTRAINT fk_friendships_user_low
    FOREIGN KEY (user_low_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_friendships_user_high
    FOREIGN KEY (user_high_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_friendships_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_friendships_order CHECK (user_low_id < user_high_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('friendships');
    }
};
