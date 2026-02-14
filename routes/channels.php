<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;

Broadcast::channel('conversation.{id}', function ($user, int $id) {
    $isParticipant = DB::table('conversation_participants')
        ->where('conversation_id', $id)
        ->where('user_id', $user->id)
        ->exists();
    if ($isParticipant) {
        return true;
    }
    $isCreator = DB::table('conversations')
        ->where('id', $id)
        ->where('created_by_id', $user->id)
        ->exists();
    return $isCreator;
});

Broadcast::channel('gc.{id}', function ($user, int $id) {
    return in_array((string) $user->role, ['buyer', 'merchant', 'midman', 'admin'], true);
});
