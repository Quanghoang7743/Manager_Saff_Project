<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NULL,
  avatar_url VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  owner_user_id BIGINT UNSIGNED NULL,
  description VARCHAR(500) NULL,
  last_message_id BIGINT UNSIGNED NULL,
  last_message_at DATETIME(3) NULL,
  member_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_encrypted TINYINT(1) NOT NULL DEFAULT 0,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_conversations_type_updated (conversation_type, updated_at),
  KEY idx_conversations_last_message_at (last_message_at),
  KEY idx_conversations_created_by (created_by),
  CONSTRAINT chk_conversations_type CHECK (conversation_type IN ('direct', 'group')),
  CONSTRAINT fk_conversations_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_conversations_owner_user
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
