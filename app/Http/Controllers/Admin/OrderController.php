<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResolveOrderDisputeRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Models\OrderDispute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

final class OrderController extends Controller
{
    public function index(Request $request)
    {
        $q = Order::query()
            ->select([
                'id',
                'order_no',
                'status',
                'buyer_id',
                'seller_id',
                'amount',
                'currency',
                'listing_type_snapshot',
                'created_at',
                \Illuminate\Support\Facades\DB::raw('(select opp.id_image_path from order_payment_proofs opp where opp.order_id = orders.id order by opp.created_at desc limit 1) as id_image_path'),
                \Illuminate\Support\Facades\DB::raw('(select opp.receipt_image_path from order_payment_proofs opp where opp.order_id = orders.id order by opp.created_at desc limit 1) as receipt_image_path'),
                \Illuminate\Support\Facades\DB::raw('(select opp.status from order_payment_proofs opp where opp.order_id = orders.id order by opp.created_at desc limit 1) as proof_status'),
                \Illuminate\Support\Facades\DB::raw('(select opp.payment_reference from order_payment_proofs opp where opp.order_id = orders.id order by opp.created_at desc limit 1) as payment_reference'),
            ]);

        if ($request->filled('status')) {
            $q->where('status', $request->string('status')->toString());
        }

        if ($request->filled('buyer_id')) {
            $q->where('buyer_id', (int) $request->input('buyer_id'));
        }

        if ($request->filled('seller_id')) {
            $q->where('seller_id', (int) $request->input('seller_id'));
        }

        if ($request->filled('order_no')) {
            $q->where('order_no', 'like', '%' . $request->string('order_no')->toString() . '%');
        }

        if ($request->filled('date_from')) {
            $q->where('created_at', '>=', Carbon::parse($request->input('date_from'))->startOfDay());
        }

        if ($request->filled('date_to')) {
            $q->where('created_at', '<=', Carbon::parse($request->input('date_to'))->endOfDay());
        }

        $sort = $request->string('sort', 'created_at')->toString();
        $dir = strtolower($request->string('dir', 'desc')->toString()) === 'asc' ? 'asc' : 'desc';

        if (!in_array($sort, ['id', 'order_no', 'status', 'amount', 'created_at'], true)) {
            $sort = 'created_at';
        }

        $q->orderBy($sort, $dir);

        $orders = $q->paginate((int) $request->input('per_page', 20));

        if ($request->wantsJson()) {
            return response()->json($orders);
        }

        return Inertia::render('Admin/Orders', [
            'initial' => $orders,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::query()
            ->select([
                'id',
                'order_no',
                'status',
                'buyer_id',
                'seller_id',
                'amount',
                'currency',
                'created_at',
                'listing_title_snapshot',
                'listing_type_snapshot',
                'game_snapshot',
            ])
            ->with([
                // these relations are optional; if you don't have them, remove the with() or define them in Order model
                'buyer:id,name,username,email,role',
                'seller:id,name,username,email,role',
                'dispute:id,order_id,status,resolution,decision_notes,decided_by_id,decided_at,created_at',
            ])
            ->withTrashed()
            ->findOrFail($id);

        return response()->json(['data' => $order]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();

        $order = DB::transaction(function () use ($validated, $id) {
            /** @var Order $order */
            $order = Order::lockForUpdate()->findOrFail($id);

            $order->update([
                'status' => $validated['status'],
            ]);

            // Reload the model safely (NO relationships)
            return $order->refresh();
        });

        return response()->json([
            'message' => 'Order status updated.',
            'data' => [
                'id' => $order->id,
                'order_no' => $order->order_no,
                'status' => $order->status,
                'updated_at' => $order->updated_at,
            ],
        ]);
    }
public function resolveDispute(ResolveOrderDisputeRequest $request, int $id): JsonResponse
{
    $validated = $request->validated();
    $adminId = (int) auth()->id();

    $result = DB::transaction(function () use ($validated, $adminId, $id) {

        /** @var Order $order */
        $order = Order::lockForUpdate()->findOrFail($id);

        /** @var OrderDispute $dispute */
        $dispute = OrderDispute::lockForUpdate()
            ->where('order_id', $order->id)
            ->first();

        if (! $dispute) {
            $dispute = OrderDispute::create([
                'order_id' => $order->id,
                'status' => 'open',
            ]);
        }

        // Update dispute
        $dispute->update([
            'status' => $validated['status'],
            'resolution' => $validated['resolution'],
            'decision_notes' => $validated['decision_notes'] ?? null,
            'decided_by_id' => $adminId,
            'decided_at' => now(),
        ]);

        // Sync order status based on resolution
        if ($validated['status'] === 'resolved') {
            $order->status = match ($validated['resolution']) {
                'refund_buyer', 'partial_refund' => 'refunded',
                'cancel_order' => 'cancelled',
                'release_to_seller' => 'completed',
                default => $order->status,
            };
        } else {
            $order->status = 'disputed';
        }

        $order->save();

        return [
            'order' => $order->refresh(),
            'dispute' => $dispute->refresh(),
        ];
    });

    return response()->json([
        'message' => 'Order dispute resolved.',
        'data' => [
            'order' => [
                'id' => $result['order']->id,
                'status' => $result['order']->status,
                'updated_at' => $result['order']->updated_at,
            ],
            'dispute' => [
                'id' => $result['dispute']->id,
                'order_id' => $result['dispute']->order_id,
                'status' => $result['dispute']->status,
                'resolution' => $result['dispute']->resolution,
                'decision_notes' => $result['dispute']->decision_notes,
                'decided_by_id' => $result['dispute']->decided_by_id,
                'decided_at' => $result['dispute']->decided_at,
            ],
        ],
    ]);
}

public function destroy(int $id): JsonResponse
{
    $order = DB::transaction(function () use ($id) {
        /** @var Order $order */
        $order = Order::lockForUpdate()->find($id);
        if (! $order) {
            abort(404, 'Order already deleted or not found.');
        }

        $payload = [
            'id' => $order->id,
            'order_no' => $order->order_no,
        ];

        // If you use soft deletes, this will soft-delete
        // Otherwise, it will hard-delete
        $order->delete();

        return $payload;
    });

    return response()->json([
        'message' => 'Order deleted.',
        'data' => $order,
    ]);
}
}
