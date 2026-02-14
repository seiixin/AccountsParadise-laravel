<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

final class AdminController extends Controller
{
    public function dashboard()
    {
        // High-level metrics (safe even if you haven't defined relationships)
        $ordersTotal = DB::table('orders')->count();
        $ordersByStatus = DB::table('orders')
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderByDesc('total')
            ->get();

        $pendingPayouts = DB::table('payout_requests')->where('status', 'pending')->count();
        $openDisputes = DB::table('order_disputes')->whereIn('status', ['open', 'pending', 'under_review'])->count();
        $usersTotal = DB::table('users')->count();

        $recentOrders = DB::table('orders')
            ->select(['id', 'order_no', 'status', 'buyer_id', 'seller_id', 'amount', 'currency', 'listing_type_snapshot', 'created_at'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        if (request()->wantsJson()) {
            return response()->json([
                'metrics' => [
                    'orders_total' => $ordersTotal,
                    'orders_by_status' => $ordersByStatus,
                    'pending_payout_requests' => $pendingPayouts,
                    'open_order_disputes' => $openDisputes,
                    'users_total' => $usersTotal,
                ],
                'recent_orders' => $recentOrders,
            ]);
        }

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'orders_total' => $ordersTotal,
                'orders_by_status' => $ordersByStatus,
                'pending_payout_requests' => $pendingPayouts,
                'open_order_disputes' => $openDisputes,
                'users_total' => $usersTotal,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
