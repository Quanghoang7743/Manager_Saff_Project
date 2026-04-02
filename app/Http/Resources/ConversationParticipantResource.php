<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'conversation_id' => $this->conversation_id,
            'user' => new UserSummaryResource($this->whenLoaded('user', $this->user)),
            'participant_role' => $this->participant_role,
            'nickname' => $this->nickname,
            'last_read_message_id' => $this->last_read_message_id,
            'last_read_at' => optional($this->last_read_at)?->format('Y-m-d H:i:s.v'),
            'last_delivered_message_id' => $this->last_delivered_message_id,
            'last_delivered_at' => optional($this->last_delivered_at)?->format('Y-m-d H:i:s.v'),
            'muted_until' => optional($this->muted_until)?->format('Y-m-d H:i:s.v'),
            'is_muted' => (bool) $this->is_muted,
            'is_pinned' => (bool) $this->is_pinned,
            'is_archived' => (bool) $this->is_archived,
            'is_hidden' => (bool) $this->is_hidden,
            'custom_conversation_name' => $this->custom_conversation_name,
            'unread_count_cache' => $this->unread_count_cache,
        ];
    }
}
