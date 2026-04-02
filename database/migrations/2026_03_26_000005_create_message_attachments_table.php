<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE message_attachments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  message_id BIGINT UNSIGNED NOT NULL,
  attachment_type VARCHAR(20) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_ext VARCHAR(20) NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  storage_provider VARCHAR(30) NOT NULL DEFAULT 's3',
  storage_bucket VARCHAR(100) NULL,
  storage_key VARCHAR(500) NOT NULL,
  file_url VARCHAR(1000) NULL,
  thumbnail_url VARCHAR(1000) NULL,
  checksum_sha256 VARCHAR(64) NULL,
  width INT NULL,
  height INT NULL,
  duration_seconds INT NULL,
  preview_text VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_message_attachments_message (message_id),
  KEY idx_message_attachments_storage_key (storage_key(191)),
  CONSTRAINT fk_message_attachments_message
    FOREIGN KEY (message_id) REFERENCES messages(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_message_attachments_type CHECK (
    attachment_type IN ('image', 'video', 'audio', 'file')
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
    }
};
