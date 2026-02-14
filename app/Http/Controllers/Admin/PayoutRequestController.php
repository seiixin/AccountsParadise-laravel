<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApprovePayoutRequest;
use App\Models\PayoutRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

final class PayoutRequestController extends Controller
{
    public function index(Request $request)
    {
        $q = PayoutRequest::query()
            ->select([
                'id',
                'amount',
                'status',
                'created_at',
            ]);

        if ($request->filled('status')) {
            $q->where('status', $request->string('status')->toString());
        }

        if ($request->filled('date_from')) {
            $q->where('created_at', '>=', Carbon::parse($request->input('date_from'))->startOfDay());
        }

        if ($request->filled('date_to')) {
            $q->where('created_at', '<=', Carbon::parse($request->input('date_to'))->endOfDay());
        }

        $q->orderByDesc('created_at');

        $items = $q->paginate((int) $request->input('per_page', 20));

        if ($request->wantsJson()) {
            return response()->json($items);
        }

        return Inertia::render('Admin/PayoutRequests', [
            'initial' => $items,
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $payout = PayoutRequest::query()
            ->select(['id', 'amount', 'currency', 'status', 'created_at', 'orders_snapshot', 'orders_count'])
            ->findOrFail($id);

        return response()->json($payout);
    }

public function approve(ApprovePayoutRequest $request, int $id): JsonResponse
{
    $validated = $request->validated();
    $adminId = (int) auth()->id();

    $payout = DB::transaction(function () use ($validated, $adminId, $id) {

        /** @var PayoutRequest $payout */
        $payout = PayoutRequest::lockForUpdate()->findOrFail($id);

        if ($validated['action'] === 'approve') {
            $payout->status = 'approved';
        } else {
            $payout->status = 'rejected';
        }

        $payout->approved_by_id = $adminId;
        $payout->approved_at = now();
        $payout->approval_notes = $validated['approval_notes'] ?? null;

        $payout->save();

        // ⛔ DO NOT pass columns to fresh()
        return $payout->refresh();
    });

    return response()->json([
        'message' => 'Payout request updated.',
        'data' => [
            'id' => $payout->id,
            'status' => $payout->status,
            'approved_by_id' => $payout->approved_by_id,
            'approved_at' => $payout->approved_at,
            'approval_notes' => $payout->approval_notes,
        ],
    ]);
}
}
