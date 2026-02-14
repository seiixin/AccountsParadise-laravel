<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $q = Listing::query()
            ->select(['id', 'merchant_id', 'title', 'price', 'currency', 'category_id', 'is_featured', 'created_at'])
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at');

        if ($request->filled('q')) {
            $term = $request->string('q')->toString();
            $q->where('title', 'like', '%' . $term . '%');
        }

        if ($request->wantsJson()) {
            return response()->json($q->paginate((int) $request->input('per_page', 20)));
        }

        return Inertia::render('Admin/Listings', [
            'initial' => $q->paginate((int) $request->input('per_page', 20)),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $listing = Listing::query()
            ->select(['id', 'merchant_id', 'title', 'description', 'price', 'currency', 'category_id', 'is_featured', 'created_at'])
            ->findOrFail($id);

        if ($request->wantsJson()) {
            return response()->json($listing);
        }

        return Inertia::render('Admin/ListingDetails', [
            'listing' => $listing,
        ]);
    }
}
