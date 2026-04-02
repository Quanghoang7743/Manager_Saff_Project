<?php

use App\Models\ConversationParticipant;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function (User $user, int $id): bool {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId): bool {
    return ConversationParticipant::query()
        ->where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->whereNull('left_at')
        ->whereNull('removed_at')
        ->exists();
});

Broadcast::channel('conversation-presence.{conversationId}', function (User $user, int $conversationId): array|bool {
    $isParticipant = ConversationParticipant::query()
        ->where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->whereNull('left_at')
        ->whereNull('removed_at')
        ->exists();

    if (! $isParticipant) {
        return false;
    }

    return [
        'id' => $user->id,
        'display_name' => $user->display_name,
        'username' => $user->username,
        'avatar_url' => $user->avatar_url,
        'presence_status' => $user->presence_status,
    ];
});
