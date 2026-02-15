<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoginAlert;
use Illuminate\Support\Facades\Log;

class SendLoginNotification
{
    public function handle(Login $event): void
    {
        $user = $event->user;
        if (!$user || !$user->email) return;
        $ip = request()->ip() ?? 'Unknown';
        $agent = request()->header('User-Agent') ?? 'Unknown';
        $time = now()->toDateTimeString();
        try {
            $mailer = app()->environment('local') ? 'failover' : config('mail.default');
            Mail::mailer($mailer)->to($user->email)->send(new LoginAlert($ip, $agent, $time));
        } catch (\Throwable $e) {
            Log::warning('LoginAlert mail failed: '.$e->getMessage(), [
                'user_id' => $user->id ?? null,
                'email' => $user->email,
            ]);
            // Do not block login if mail transport fails
        }
    }
}
