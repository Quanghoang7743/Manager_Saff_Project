<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE conversation_participants (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  participant_role VARCHAR(20) NOT NULL DEFAULT 'member',
  nickname VARCHAR(100) NULL,
  joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  left_at DATETIME(3) NULL,
  removed_at DATETIME(3) NULL,
  last_read_message_id BIGINT UNSIGNED NULL,
  last_read_at DATETIME(3) NULL,
  last_delivered_message_id BIGINT UNSIGNED NULL,
  last_delivered_at DATETIME(3) NULL,
  muted_until DATETIME(3) NULL,
  is_muted TINYINT(1) NOT NULL DEFAULT 0,
  is_pinned TINYINT(1) NOT NULL DEFAULT 0,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  is_hidden TINYINT(1) NOT NULL DEFAULT 0,
  custom_conversation_name VARCHAR(255) NULL,
  unread_count_cache INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (conversation_id, user_id),
  KEY idx_cp_user_active (user_id, left_at, removed_at),
  KEY idx_cp_user_pinned (user_id, is_pinned),
  KEY idx_cp_last_read_message_id (last_read_message_id),
  CONSTRAINT fk_cp_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cp_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_cp_role CHECK (participant_role IN ('owner', 'admin', 'member'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_participants');
    }
};
