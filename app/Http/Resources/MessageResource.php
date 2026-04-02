<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $deletedForEveryone = $this->deleted_for_everyone_at !== null;

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender' => new UserSummaryResource($this->whenLoaded('sender', $this->sender)),
            'client_message_id' => $this->client_message_id,
            'message_type' => $this->message_type,
            'content' => $deletedForEveryone ? null : $this->content,
            'content_json' => $deletedForEveryone ? null : $this->content_json,
            'reply_to_message_id' => $this->reply_to_message_id,
            'forward_from_message_id' => $this->forward_from_message_id,
            'sent_at' => optional($this->sent_at)?->clone()->setTimezone(config('app.display_timezone'))->format('H:i'),
            'delivered_at' => optional($this->delivered_at)?->format('Y-m-d H:i:s.v'),
            'edited_at' => optional($this->edited_at)?->format('Y-m-d H:i:s.v'),
            'deleted_for_everyone_at' => optional($this->deleted_for_everyone_at)?->format('Y-m-d H:i:s.v'),
            'sender_deleted_at' => optional($this->sender_deleted_at)?->format('Y-m-d H:i:s.v'),
            'message_status' => $this->message_status,
            'has_attachments' => (bool) $this->has_attachments,
            'attachments' => MessageAttachmentResource::collection($this->whenLoaded('attachments', $this->attachments)),
            'reactions' => MessageReactionResource::collection($this->whenLoaded('reactions', $this->reactions)),
            'reactions_count' => $this->whenCounted('reactions'),
            'my_reactions' => $this->when(isset($this->my_reactions), $this->my_reactions),
            'created_at' => optional($this->created_at)?->format('Y-m-d H:i:s.v'),
            'updated_at' => optional($this->updated_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
