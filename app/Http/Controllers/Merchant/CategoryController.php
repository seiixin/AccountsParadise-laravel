<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * GET /merchant/categories
     */
    public function index()
    {
        return Category::select('id', 'name', 'status')
            ->where(function ($q) {
                $q->where('status', 'approved')
                  ->orWhere(function ($qq) {
                      $qq->where('status', 'pending')
                         ->where('created_by_id', Auth::id());
                  });
            })
            ->orderBy('name')
            ->get();
    }

    /**
     * POST /merchant/categories/create
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        return Category::create([
            'name' => $request->name,
            'status' => 'pending',
            'created_by_id' => Auth::id(),
        ]);
    }

    /**
     * GET /merchant/categories/{id}
     */
    public function show($id)
    {
        return Category::select('id', 'name', 'status')
            ->where('created_by_id', Auth::id())
            ->findOrFail($id);
    }

    /**
     * PUT /merchant/categories/{id}/update
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::where('created_by_id', Auth::id())
            ->where('status', 'pending')
            ->findOrFail($id);

        $category->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Category updated successfully',
        ]);
    }
}
    
