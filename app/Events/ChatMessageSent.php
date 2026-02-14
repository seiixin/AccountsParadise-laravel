<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public int $conversationId;
    public string $conversationType;
    public array $message;

    public function __construct(int $conversationId, string $conversationType, array $message)
    {
        $this->conversationId = $conversationId;
        $this->conversationType = $conversationType;
        $this->message = $message;
    }

    public function broadcastOn(): Channel
    {
        if ($this->conversationType === 'direct') {
            return new PrivateChannel('conversation.' . $this->conversationId);
        }
        return new Channel('gc.' . $this->conversationId);
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
