<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory;
    use SoftDeletes;
    
    protected $fillable = [
        'order_no',
        'status',
        'buyer_id',
        'seller_id',
        'amount',
        'currency',
        'listing_title_snapshot',
        'listing_type_snapshot',
        'game_snapshot',
    ];

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function dispute()
    {
        return $this->hasOne(OrderDispute::class);
    }

    public function delivery()
    {
        return $this->hasOne(OrderDelivery::class);
    }
}
