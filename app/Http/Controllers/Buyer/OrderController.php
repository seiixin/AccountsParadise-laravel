<?php

namespace App\Http\Controllers\Buyer;

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
        $buyerId = $request->filled('buyer_id') ? (int) $request->input('buyer_id') : (int) auth()->id();
        $query = Order::query()
            ->select('id', 'order_no', 'status', 'amount', 'currency', 'listing_title_snapshot', 'created_at')
            ->where('buyer_id', $buyerId)
            ->withTrashed()
            ->latest();

        $forceJson = $request->input('format') === 'json';
        if ($request->wantsJson() || $forceJson) {
            return response()->json($query->paginate((int) $request->input('per_page', 20)));
        }

        return Inertia::render('Buyer/Orders', [
            'initial' => $query->paginate((int) $request->input('per_page', 20)),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $buyerId = $request->filled('buyer_id') ? (int) $request->input('buyer_id') : (int) auth()->id();
        $order = Order::where('buyer_id', $buyerId)
            ->select(
                'id',
                'order_no',
                'status',
                'amount',
                'currency',
                'created_at',
                'listing_title_snapshot',
                'game_snapshot'
            )
            ->findOrFail($id);

        $proof = \Illuminate\Support\Facades\DB::table('order_payment_proofs')
            ->select('id', 'order_id', 'payment_reference', 'id_image_path', 'receipt_image_path', 'status', 'reviewed_by_id', 'reviewed_at', 'review_notes', 'created_at')
            ->where('order_id', $order->id)
            ->orderByDesc('created_at')
            ->first();

        if ($request->wantsJson()) {
            return response()->json(['order' => $order, 'proof' => $proof]);
        }

        return Inertia::render('Buyer/OrderDetails', [
            'order' => $order,
            'proof' => $proof,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string'],
        ]);

        $order = Order::where('buyer_id', auth()->id())->findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json($order);
    }

    
    public function disputeOrder($id, Request $request)
    {
        // Find the order by ID and update dispute information
        $order = Order::findOrFail($id);

        // Validate incoming data
        $request->validate([
            'status' => 'required|string',
            'reason' => 'required|string',
            'description' => 'required|string',
            'evidence' => 'nullable|string',
        ]);

        // Logic to update the order dispute
        $order->status = $request->status;
        $order->dispute_reason = $request->reason;
        $order->dispute_description = $request->description;
        $order->dispute_evidence = $request->evidence;
        $order->save();

        return response()->json(['message' => 'Dispute successfully created']);
    }

}
