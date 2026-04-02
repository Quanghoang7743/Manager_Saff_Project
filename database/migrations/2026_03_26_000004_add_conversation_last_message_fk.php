<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE conversations ADD CONSTRAINT fk_conversations_last_message FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL');
        DB::statement('ALTER TABLE conversation_participants ADD CONSTRAINT fk_cp_last_read_message FOREIGN KEY (last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL');
        DB::statement('ALTER TABLE conversation_participants ADD CONSTRAINT fk_cp_last_delivered_message FOREIGN KEY (last_delivered_message_id) REFERENCES messages(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE conversation_participants DROP FOREIGN KEY fk_cp_last_delivered_message');
        DB::statement('ALTER TABLE conversation_participants DROP FOREIGN KEY fk_cp_last_read_message');
        DB::statement('ALTER TABLE conversations DROP FOREIGN KEY fk_conversations_last_message');
    }
};
