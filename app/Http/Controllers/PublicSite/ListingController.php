<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ListingController extends Controller
{
    public function show(Request $request, int $id)
    {
        $listing = DB::table('listings')
            ->leftJoin('users', 'users.id', '=', 'listings.merchant_id')
            ->select([
                'listings.id',
                'listings.title',
                'listings.description',
                'listings.price',
                'listings.currency',
                'listings.category_id',
                'listings.cover_image_path',
                'listings.created_at',
                'listings.merchant_id',
                'users.name as merchant_name',
                DB::raw('NULL as merchant_avatar'),
            ])
            ->where('listings.id', $id)
            ->first();

        abort_unless($listing, 404);

        $images = Schema::hasTable('listing_images')
            ? DB::table('listing_images')
                ->where('listing_id', $id)
                ->orderBy('sort_order')
                ->select(['id','path','sort_order'])
                ->get()
            : collect();

        if ($request->wantsJson()) {
            return response()->json(['listing' => $listing, 'images' => $images]);
        }

        return Inertia::render('Listing', [
            'listing' => $listing,
            'images' => $images,
        ]);
    }
}
