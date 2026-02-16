<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class PayoutRequestController extends Controller
{
    public function index(Request $request)
    {
        $q = PayoutRequest::query()
            ->where('seller_id', auth()->id())
            ->select(['id', 'amount', 'currency', 'status', 'created_at'])
            ->orderByDesc('created_at');

        $items = $q->paginate((int) $request->input('per_page', 20));

        if ($request->wantsJson()) {
            return response()->json($items);
        }

        return Inertia::render('Merchant/PayoutRequests', [
            'initial' => $items,
        ]);
    }
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['nullable', 'numeric'],
            'currency' => ['nullable', 'string'],
            'order_ids' => ['nullable', 'array'],
            'order_ids.*' => ['integer'],
        ]);

        if (!empty($data['order_ids'])) {
            $orders = \App\Models\Order::query()
                ->where('seller_id', auth()->id())
                ->whereIn('id', $data['order_ids'])
                ->where('status', 'completed')
                ->where('payout_complete', false)
                ->select(['id', 'order_no', 'amount', 'currency', 'status', 'listing_title_snapshot', 'created_at'])
                ->get();

            if ($orders->isEmpty()) {
                return response()->json(['message' => 'No eligible completed orders found'], 422);
            }

            $currency = $orders->first()->currency;
            $total = $orders->sum('amount');
            $snapshot = $orders->map(function ($o) {
                return [
                    'id' => $o->id,
                    'order_no' => $o->order_no,
                    'amount' => $o->amount,
                    'currency' => $o->currency,
                    'status' => $o->status,
                    'title' => $o->listing_title_snapshot,
                    'created_at' => $o->created_at,
                ];
            })->all();

            $payout = PayoutRequest::create([
                'seller_id' => auth()->id(),
                'amount' => $total,
                'currency' => $currency,
                'status' => 'pending',
                'orders_snapshot' => $snapshot,
                'orders_count' => count($snapshot),
            ]);
        } else {
            $payload = [
                'seller_id' => auth()->id(),
                'amount' => (float) $data['amount'],
                'currency' => $data['currency'] ?? 'PHP',
                'status' => 'pending',
            ];
            $payout = PayoutRequest::create($payload);
        }

        return response()->json($payout, 201);
    }

    public function show(int $id): JsonResponse
    {
        $payout = PayoutRequest::where('seller_id', auth()->id())
            ->select('id', 'amount', 'currency', 'status', 'created_at', 'orders_snapshot', 'orders_count')
            ->findOrFail($id);

        return response()->json($payout);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string'],
            'approval_notes' => ['nullable', 'string'],
        ]);

        $payout = PayoutRequest::findOrFail($id);
        $payout->update([
            'status' => $request->status,
            'approved_by_id' => auth()->id(),
            'approved_at' => now(),
            'approval_notes' => $request->approval_notes,
        ]);

        return response()->json($payout);
    }
}
