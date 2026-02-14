<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderPaymentProof extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_reference',
        'id_image_path',
        'receipt_image_path',
        'status',
        'reviewed_by_id',
        'reviewed_at',
        'review_notes',
        'idscan_status',
        'idscan_provider',
        'idscan_result',
        'idscan_request_id',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'idscan_result' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
    }
}
