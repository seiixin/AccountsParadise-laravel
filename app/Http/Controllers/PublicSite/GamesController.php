<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GamesController extends Controller
{
    public function index(Request $request)
    {
        $categories = DB::table('categories')
            ->select(['id', 'name'])
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        $q = DB::table('listings')
            ->select(['id', 'title', 'price', 'currency', 'category_id', 'is_featured', 'cover_image_path', 'created_at'])
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at');

        if ($request->filled('category_id')) {
            $q->where('category_id', (int) $request->input('category_id'));
        }
        if ($search = $request->string('q')->toString()) {
            $q->where('title', 'like', '%' . $search . '%');
        }

        $listings = $q->paginate((int) $request->input('per_page', 12));

        if ($request->wantsJson()) {
            return response()->json([
                'categories' => $categories,
                'listings' => $listings,
            ]);
        }

        return Inertia::render('Games', [
            'categories' => $categories,
            'initial' => $listings,
        ]);
    }
}
