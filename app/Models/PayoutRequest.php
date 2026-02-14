<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayoutRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'amount',
        'currency',
        'status',
        'approved_by_id',
        'approved_at',
        'approval_notes',
        'orders_snapshot',
        'orders_count',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'orders_snapshot' => 'array',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }
}
