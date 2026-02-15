<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactUsMessage extends Mailable
{
    use Queueable, SerializesModels;

    public string $fromEmail;
    public string $content;

    public function __construct(string $fromEmail, string $content)
    {
        $this->fromEmail = $fromEmail;
        $this->content = $content;
    }

    public function build()
    {
        return $this->subject('Contact Us Message')
            ->markdown('emails.contact', [
                'fromEmail' => $this->fromEmail,
                'content' => $this->content,
            ]);
    }
}
