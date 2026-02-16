<?php

namespace App\Http\Controllers\Midman;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PayoutRequestController extends Controller
{
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

        if ($payout->status === 'approved' && !empty($payout->orders_snapshot)) {
            $orderIds = collect($payout->orders_snapshot)
                ->pluck('id')
                ->filter()
                ->map(fn ($v) => (int) $v)
                ->all();

            if (!empty($orderIds)) {
                \App\Models\Order::query()
                    ->whereIn('id', $orderIds)
                    ->update(['payout_complete' => true]);
            }
        }

        return response()->json($payout);
    }
}
