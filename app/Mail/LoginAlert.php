<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoginAlert extends Mailable
{
    use Queueable, SerializesModels;

    public string $ip;
    public string $agent;
    public string $time;

    public function __construct(string $ip, string $agent, string $time)
    {
        $this->ip = $ip;
        $this->agent = $agent;
        $this->time = $time;
    }

    public function build()
    {
        return $this->subject('New Login to Your Account')
            ->markdown('emails.login_alert', [
                'ip' => $this->ip,
                'agent' => $this->agent,
                'time' => $this->time,
            ]);
    }
}
