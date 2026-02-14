<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\OrderDispute;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderDisputeController extends Controller
{
    /**
     * List disputes for current buyer
     * GET /buyer/order-disputes
     */
    public function index(Request $request): JsonResponse
    {
        $buyerId = (int) auth()->id();
        $perPage = (int) $request->input('per_page', 20);
        $q = OrderDispute::query()
            ->select(['id', 'order_id', 'status', 'reason', 'description', 'evidence', 'resolution', 'decision_notes', 'decided_by_id', 'decided_at', 'created_at'])
            ->with(['order' => function ($q) {
                $q->select('id', 'order_no', 'buyer_id');
            }])
            ->whereHas('order', function ($qq) use ($buyerId) {
                $qq->where('buyer_id', $buyerId);
            })
            ->orderByDesc('created_at');
        $items = $q->paginate($perPage);
        return response()->json($items);
    }

    /**
     * Buyer opens a dispute
     * POST /buyer/order-disputes
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'status' => ['nullable', 'string', 'in:under_review,disputed,open'],
            'reason' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'evidence' => ['nullable', 'string'],
            'evidence_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        $evidencePath = null;
        if ($request->hasFile('evidence_image')) {
            $evidencePath = $request->file('evidence_image')->store('evidence', 'public');
        }

        $dispute = OrderDispute::create([
            'order_id' => $data['order_id'],
            'status' => $data['status'] ?? 'under_review',
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'evidence' => $evidencePath ?? ($data['evidence'] ?? null),
        ]);

        return response()->json($dispute, 201);
    }

    /**
     * Buyer resolves OWN dispute
     * PUT /buyer/order-disputes/{id}/resolve
     */
    public function resolve(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:resolved,cancelled'],
            'resolution' => ['nullable', 'string'],
            'decision_notes' => ['nullable', 'string'],
        ]);

        $dispute = OrderDispute::with('order')->findOrFail($id);

        // Buyer can only resolve disputes for their own orders
        abort_if(
            $dispute->order->buyer_id !== auth()->id(),
            403,
            'Unauthorized'
        );

        $dispute->update([
            'status' => $data['status'],
            'resolution' => $data['resolution'] ?? null,
            'decision_notes' => $data['decision_notes'] ?? null,
            'decided_by_id' => auth()->id(),
            'decided_at' => now(),
        ]);

        return response()->json([
            'message' => 'Dispute resolved',
            'dispute' => $dispute,
        ]);
    }
}
