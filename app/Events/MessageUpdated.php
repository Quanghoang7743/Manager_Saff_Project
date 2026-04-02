<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public readonly Message $message) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('conversation.'.$this->message->conversation_id);
    }

    public function broadcastAs(): string
    {
        return 'message.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->message->conversation_id,
            'message' => [
                'id' => $this->message->id,
                'message_type' => $this->message->message_type,
                'content' => $this->message->content,
                'content_json' => $this->message->content_json,
                'has_attachments' => (bool) $this->message->has_attachments,
                'attachments' => $this->message->attachments->map(fn ($attachment) => [
                    'id' => $attachment->id,
                    'attachment_type' => $attachment->attachment_type,
                    'file_name' => $attachment->file_name,
                    'file_ext' => $attachment->file_ext,
                    'mime_type' => $attachment->mime_type,
                    'file_size' => $attachment->file_size,
                    'storage_provider' => $attachment->storage_provider,
                    'storage_bucket' => $attachment->storage_bucket,
                    'storage_key' => $attachment->storage_key,
                    'file_url' => $attachment->file_url,
                    'thumbnail_url' => $attachment->thumbnail_url,
                ])->values(),
                'edited_at' => optional($this->message->edited_at)?->format('Y-m-d H:i:s.v'),
                'deleted_for_everyone_at' => optional($this->message->deleted_for_everyone_at)?->format('Y-m-d H:i:s.v'),
                'updated_at' => optional($this->message->updated_at)?->format('Y-m-d H:i:s.v'),
            ],
        ];
    }
}
