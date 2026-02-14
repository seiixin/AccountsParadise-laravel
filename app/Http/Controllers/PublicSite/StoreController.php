<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $q = DB::table('listings')
            ->select(['listings.id', 'listings.title', 'listings.type', 'listings.price', 'listings.currency', 'listings.category_id', 'listings.is_featured', 'listings.cover_image_path', 'listings.created_at'])
            ->orderByDesc('listings.is_featured')
            ->orderByDesc('listings.created_at');

        if ($search = $request->string('q')->toString()) {
            $q->where('listings.title', 'like', '%' . $search . '%');
        }
        if ($request->filled('category_id')) {
            $q->where('listings.category_id', (int) $request->input('category_id'));
        }
        if ($request->filled('type')) {
            $type = $request->string('type')->toString();
            if (in_array($type, ['account', 'item'], true)) {
                $q->where('listings.type', $type);
            }
        }

        $listings = $q->paginate((int) $request->input('per_page', 12));

        $categories = DB::table('categories')
            ->select(['id', 'name'])
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'listings' => $listings,
                'categories' => $categories,
            ]);
        }

        return Inertia::render('Store', [
            'initial' => $listings,
            'categories' => $categories,
        ]);
    }
}
