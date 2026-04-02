<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE user_devices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  device_uuid VARCHAR(100) NOT NULL,
  device_type VARCHAR(20) NOT NULL,
  device_name VARCHAR(100) NULL,
  push_token VARCHAR(512) NULL,
  app_version VARCHAR(50) NULL,
  os_version VARCHAR(50) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_active_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_devices_user_device_uuid (user_id, device_uuid),
  KEY idx_user_devices_push_token (push_token(191)),
  KEY idx_user_devices_user_active (user_id, is_active),
  CONSTRAINT fk_user_devices_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
