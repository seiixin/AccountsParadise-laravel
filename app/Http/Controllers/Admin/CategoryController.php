<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $items = Category::select('id', 'name', 'status', 'created_at')->orderByDesc('created_at')->paginate((int) $request->input('per_page', 20));

        if ($request->wantsJson()) {
            return response()->json($items);
        }

        return Inertia::render('Admin/Categories', [
            'initial' => $items,
        ]);
    }

    public function show($id)
    {
        return Category::select('id', 'name', 'status')->findOrFail($id);
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $category = Category::findOrFail($id);
        $category->status = $request->status;
        $category->approved_by_id = Auth::id();
        $category->approved_at = now();
        $category->save();

        return response()->json(['message' => 'Category status updated']);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::findOrFail($id);
        $category->update([
            'name' => $request->name,
        ]);

        return response()->json(['message' => 'Category updated']);
    }

    public function destroy($id)
    {
        Category::findOrFail($id)->delete();

        return response()->json(['message' => 'Category deleted']);
    }
}
