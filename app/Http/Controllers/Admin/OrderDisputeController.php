<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResolveDisputeRequest;
use App\Models\OrderDispute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

final class OrderDisputeController extends Controller
{
    public function index(Request $request)
    {
        $q = OrderDispute::query()
            ->select([
                'id',
                'order_id',
                'status',
                'reason',
                'description',
                'evidence',
                'resolution',
                'created_at',
            ])
            ->with(['order' => function ($q) {
                $q->select('id', 'order_no');
            }]);

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

        return Inertia::render('Admin/Disputes', [
            'initial' => $items,
        ]);
    }

public function resolve(ResolveDisputeRequest $request, int $id): JsonResponse
{
    $validated = $request->validated();
    $adminId = (int) auth()->id();

    /** @var OrderDispute $dispute */
    $result = DB::transaction(function () use ($validated, $adminId, $id) {

        $dispute = OrderDispute::lockForUpdate()->findOrFail($id);
        $order = $dispute->order()->lockForUpdate()->first();

        $dispute->status = $validated['status'];

        if (array_key_exists('resolution', $validated)) {
            $dispute->resolution = $validated['resolution'];
        }

        $dispute->decision_notes = $validated['decision_notes'] ?? $dispute->decision_notes;
        $dispute->decided_by_id = $adminId;
        $dispute->decided_at = now();

        $dispute->save();

        if ($order) {
            if ($validated['status'] === 'resolved') {
                $order->status = match ($validated['resolution'] ?? '') {
                    'refund_buyer', 'partial_refund' => 'refunded',
                    'cancel_order' => 'cancelled',
                    'release_to_seller' => 'completed',
                    default => $order->status,
                };
            } else {
                $order->status = 'disputed';
            }
            $order->save();
        }

        return [
            'dispute' => $dispute->refresh(),
            'order' => $order ? $order->refresh() : null,
        ];
    });

    return response()->json([
        'message' => 'Dispute resolved.',
        'data' => [
            'id' => $result['dispute']->id,
            'order_id' => $result['dispute']->order_id,
            'status' => $result['dispute']->status,
            'resolution' => $result['dispute']->resolution,
            'decided_by_id' => $result['dispute']->decided_by_id,
            'decision_notes' => $result['dispute']->decision_notes,
            'decided_at' => $result['dispute']->decided_at,
            'order_status' => $result['order'] ? $result['order']->status : null,
        ],
    ]);
}
}
