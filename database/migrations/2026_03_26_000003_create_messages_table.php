<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  client_message_id VARCHAR(100) NULL,
  message_type VARCHAR(30) NOT NULL DEFAULT 'text',
  content TEXT NULL,
  content_json JSON NULL,
  reply_to_message_id BIGINT UNSIGNED NULL,
  forward_from_message_id BIGINT UNSIGNED NULL,
  sent_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  delivered_at DATETIME(3) NULL,
  edited_at DATETIME(3) NULL,
  deleted_for_everyone_at DATETIME(3) NULL,
  sender_deleted_at DATETIME(3) NULL,
  message_status VARCHAR(20) NOT NULL DEFAULT 'sent',
  has_attachments TINYINT(1) NOT NULL DEFAULT 0,
  metadata_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_messages_client_message_id_sender (sender_id, client_message_id),
  KEY idx_messages_conversation_id_id (conversation_id, id DESC),
  KEY idx_messages_conversation_sent_at (conversation_id, sent_at DESC),
  KEY idx_messages_sender_id (sender_id),
  KEY idx_messages_reply_to (reply_to_message_id),
  KEY idx_messages_forward_from (forward_from_message_id),
  KEY idx_messages_not_deleted (conversation_id, deleted_for_everyone_at, id DESC),
  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_messages_reply_to
    FOREIGN KEY (reply_to_message_id) REFERENCES messages(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_messages_forward_from
    FOREIGN KEY (forward_from_message_id) REFERENCES messages(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_messages_type CHECK (
    message_type IN ('text', 'image', 'video', 'audio', 'file', 'sticker', 'system', 'call', 'location', 'contact')
  ),
  CONSTRAINT chk_messages_status CHECK (
    message_status IN ('sending', 'sent', 'failed')
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
