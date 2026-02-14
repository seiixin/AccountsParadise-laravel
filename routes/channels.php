<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;

Broadcast::channel('conversation.{id}', function ($user, int $id) {
    return DB::table('conversation_participants')
        ->where('conversation_id', $id)
        ->where('user_id', $user->id)
        ->exists();
});

Broadcast::channel('gc.{id}', function ($user, int $id) {
    return in_array((string) $user->role, ['buyer', 'merchant', 'midman', 'admin'], true);
});

