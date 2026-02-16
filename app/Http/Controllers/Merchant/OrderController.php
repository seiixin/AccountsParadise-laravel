<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()
            ->select('id', 'order_no', 'status', 'amount', 'currency', 'listing_type_snapshot', 'created_at')
            ->latest()
            ->withTrashed();

        $all = $request->boolean('all', false);
        if (!$all) {
            $query->where('seller_id', auth()->id());
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('order_no', 'like', '%' . $q . '%');
            });
        }

        if ($request->filled('status')) {
            $status = (string) $request->input('status');
            $query->where('status', $status);
        }

        if ($request->boolean('eligible_for_payout', false)) {
            $query->where('status', 'completed')
                ->where('payout_complete', false);
        }

        $forceJson = $request->input('format') === 'json';
        if ($request->wantsJson() || $forceJson) {
            return response()->json($query->paginate((int) $request->input('per_page', 20)));
        }

        return Inertia::render('Merchant/Orders', [
            'initial' => $query->paginate((int) $request->input('per_page', 20)),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $order = Order::where('seller_id', auth()->id())
            ->select(
                'id',
                'order_no',
                'status',
                'amount',
                'currency',
                'created_at',
                'listing_title_snapshot',
                'listing_type_snapshot',
                'game_snapshot'
            )
            ->withTrashed()
            ->findOrFail($id);

        if ($request->wantsJson()) {
            return response()->json($order);
        }

        return Inertia::render('Merchant/OrderDetails', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string'],
        ]);

        $order = Order::where('seller_id', auth()->id())->findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json($order);
    }
}
