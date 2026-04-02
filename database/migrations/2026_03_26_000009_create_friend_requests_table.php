<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
CREATE TABLE friend_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  requester_id BIGINT UNSIGNED NOT NULL,
  addressee_id BIGINT UNSIGNED NOT NULL,
  phone_snapshot VARCHAR(20) NULL,
  message VARCHAR(255) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  responded_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_friend_requests_state (requester_id, addressee_id, status),
  KEY idx_friend_requests_addressee_status (addressee_id, status),
  KEY idx_friend_requests_requester_status (requester_id, status),
  CONSTRAINT fk_friend_requests_requester
    FOREIGN KEY (requester_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_friend_requests_addressee
    FOREIGN KEY (addressee_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_friend_requests_status CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('friend_requests');
    }
};
