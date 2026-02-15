<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingImage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class ListingController extends Controller
{
    /**
     * List own listings
     * GET /merchant/listings
     */
    public function index(Request $request)
    {
        $query = Listing::where('merchant_id', auth()->id())
            ->select('id', 'title', 'type', 'price', 'currency', 'category_id', 'is_featured', 'cover_image_path', 'created_at')
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at');

        if ($request->filled('type')) {
            $type = $request->input('type');
            if (in_array($type, ['account', 'item', 'boosting', 'topup'], true)) {
                $query->where('type', $type);
            }
        }
        if ($search = $request->string('q')->toString()) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        if ($request->wantsJson()) {
            return response()->json($query->paginate((int) $request->input('per_page', 20)));
        }

        return \Inertia\Inertia::render('Merchant/Listings', [
            'initial' => $query->paginate((int) $request->input('per_page', 20)),
        ]);
    }

    /**
     * Create listing
     * POST /merchant/listings/create
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric'],
            'category_id' => ['required', 'exists:categories,id'],
            'currency' => ['nullable', 'string', 'max:10'],
            'type' => ['required', 'in:account,item,boosting,topup'],
            'cover_image' => ['nullable', 'file', 'image', 'max:10240'],
            'images' => ['nullable', 'array'],
            'images.*' => ['file', 'image', 'max:10240'],
        ]);

        $path = null;
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('listings/' . auth()->id(), 'public');
        }

        $listing = Listing::create([
            'merchant_id' => auth()->id(),   // ✅ CORRECT COLUMN
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'cover_image_path' => $path,
            'price' => $data['price'],
            'currency' => $data['currency'] ?? 'PHP',
            'category_id' => $data['category_id'],
            'type' => $data['type'],
        ]);

        if ($request->hasFile('images')) {
            $i = 0;
            foreach ($request->file('images') as $img) {
                if ($i >= 10) break;
                $ipath = $img->store('listings/' . auth()->id() . '/' . $listing->id, 'public');
                ListingImage::create([
                    'listing_id' => $listing->id,
                    'path' => $ipath,
                    'sort_order' => $i++,
                ]);
            }
        }

        return response()->json($listing, 201);
    }

    /**
     * View own listing
     * GET /merchant/listings/{id}
     */
    public function show(int $id): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id())
            ->select('id', 'title', 'description', 'price', 'currency', 'category_id', 'type', 'cover_image_path', 'created_at')
            ->findOrFail($id);

        return response()->json($listing);
    }

    /**
     * Update own listing
     * PUT /merchant/listings/{id}/update
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric'],
            'currency' => ['sometimes', 'string', 'max:10'],
            'category_id' => ['sometimes', 'nullable', 'exists:categories,id'],
            'type' => ['sometimes', 'in:account,item,boosting,topup'],
        ]);

        $listing = Listing::where('merchant_id', auth()->id()) // ✅ FIX
            ->findOrFail($id);

        // Normalize nullable category
        if ($request->has('category_id') && !$request->input('category_id')) {
            $data['category_id'] = null;
        }
        $updates = collect($data)->only(['title', 'description', 'price', 'currency', 'category_id', 'type'])->toArray();
        $listing->fill($updates);
        $listing->save();

        return response()->json($listing);
    }

    public function edit(Request $request, int $id)
    {
        $listing = Listing::where('merchant_id', auth()->id())
            ->select('id', 'title', 'description', 'price', 'currency', 'category_id', 'type', 'cover_image_path', 'created_at')
            ->findOrFail($id);
        $images = Schema::hasTable('listing_images')
            ? ListingImage::where('listing_id', $listing->id)
                ->orderBy('sort_order')
                ->select('id', 'path', 'sort_order')
                ->get()
            : collect();
        return response()->json(['listing' => $listing, 'images' => $images]);
    }

    public function addImage(Request $request, int $id): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id())->findOrFail($id);
        $count = ListingImage::where('listing_id', $listing->id)->count();
        abort_if($count >= 10, 422);
        $data = $request->validate([
            'image' => ['required', 'file', 'image', 'max:10240'],
        ]);
        $path = $request->file('image')->store('listings/' . auth()->id() . '/' . $listing->id, 'public');
        $image = ListingImage::create([
            'listing_id' => $listing->id,
            'path' => $path,
            'sort_order' => $count,
        ]);
        return response()->json($image, 201);
    }

    public function deleteImage(int $id, int $imageId): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id())->findOrFail($id);
        $image = ListingImage::where('listing_id', $listing->id)->findOrFail($imageId);
        Storage::disk('public')->delete($image->path);
        $image->delete();
        return response()->json(['message' => 'Image deleted']);
    }

    public function setCover(int $id, int $imageId): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id())->findOrFail($id);
        $image = ListingImage::where('listing_id', $listing->id)->findOrFail($imageId);
        $listing->update(['cover_image_path' => $image->path]);
        return response()->json($listing);
    }

    public function replaceImage(Request $request, int $id, int $imageId): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id())->findOrFail($id);
        $data = $request->validate([
            'image' => ['required', 'file', 'image', 'max:10240'],
        ]);
        $image = ListingImage::where('listing_id', $listing->id)->findOrFail($imageId);
        $newPath = $request->file('image')->store('listings/' . auth()->id() . '/' . $listing->id, 'public');
        Storage::disk('public')->delete($image->path);
        $image->update(['path' => $newPath]);
        return response()->json($image);
    }

    public function replaceCover(Request $request, int $id): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id())->findOrFail($id);
        $data = $request->validate([
            'image' => ['required', 'file', 'image', 'max:10240'],
        ]);
        $newPath = $request->file('image')->store('listings/' . auth()->id(), 'public');
        if ($listing->cover_image_path) {
            Storage::disk('public')->delete($listing->cover_image_path);
        }
        $listing->update(['cover_image_path' => $newPath]);
        return response()->json($listing);
    }

    public function deleteCover(int $id): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id())->findOrFail($id);
        if ($listing->cover_image_path) {
            Storage::disk('public')->delete($listing->cover_image_path);
        }
        $listing->update(['cover_image_path' => null]);
        return response()->json($listing);
    }

    /**
     * Delete own listing
     * DELETE /merchant/listings/{id}/delete
     */
    public function destroy(int $id): JsonResponse
    {
        $listing = Listing::where('merchant_id', auth()->id()) // ✅ FIX
            ->findOrFail($id);

        $listing->delete();

        return response()->json([
            'id' => $id,
            'title' => $listing->title,
            'message' => 'Listing deleted',
        ]);
    }
}
