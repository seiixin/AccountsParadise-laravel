<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'stage',
        'delivery_payload',
        'received_at',
        'received_by_id',
        'delivered_at',
        'delivered_by_id',
        'delivered_to_id',
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by_id');
    }

    public function deliveredBy()
    {
        return $this->belongsTo(User::class, 'delivered_by_id');
    }

    public function deliveredTo()
    {
        return $this->belongsTo(User::class, 'delivered_to_id');
    }
}
