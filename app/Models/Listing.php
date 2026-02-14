<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'title',
        'description',
        'cover_image_path',
        'price',
        'currency',
        'category_id',
        'type',
        'is_featured',
    ];

    public function images()
    {
        return $this->hasMany(ListingImage::class)->orderBy('sort_order');
    }
}
