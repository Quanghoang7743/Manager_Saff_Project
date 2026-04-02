<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $me = $this->participants->firstWhere('user_id', $request->user()?->id);
        $directPeerParticipant = $this->conversation_type === 'direct'
            ? $this->participants->first(fn ($participant) => (int) $participant->user_id !== (int) $request->user()?->id)
            : null;
        $directPeerUser = $directPeerParticipant?->relationLoaded('user') ? $directPeerParticipant->user : null;

        return [
            'id' => $this->id,
            'conversation_type' => $this->conversation_type,
            'title' => $this->title,
            'avatar_url' => $this->avatar_url,
            'description' => $this->description,
            'creator' => new UserSummaryResource($this->whenLoaded('creator', $this->creator)),
            'owner' => $this->owner ? new UserSummaryResource($this->owner) : null,
            'last_message' => $this->lastMessage ? new MessageResource($this->lastMessage) : null,
            'direct_peer' => $directPeerUser ? new UserSummaryResource($directPeerUser) : null,
            'last_message_at' => optional($this->last_message_at)?->format('Y-m-d H:i:s.v'),
            'member_count' => $this->member_count,
            'is_encrypted' => (bool) $this->is_encrypted,
            'is_archived' => (bool) $this->is_archived,
            'is_deleted' => (bool) $this->is_deleted,
            'my_participant_settings' => $me ? [
                'participant_role' => $me->participant_role,
                'is_pinned' => (bool) $me->is_pinned,
                'is_muted' => (bool) $me->is_muted,
                'muted_until' => optional($me->muted_until)?->format('Y-m-d H:i:s.v'),
                'is_archived' => (bool) $me->is_archived,
                'is_hidden' => (bool) $me->is_hidden,
                'unread_count_cache' => $me->unread_count_cache,
            ] : null,
            'created_at' => optional($this->created_at)?->format('Y-m-d H:i:s.v'),
            'updated_at' => optional($this->updated_at)?->format('Y-m-d H:i:s.v'),
        ];
    }
}
