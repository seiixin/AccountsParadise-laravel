<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MerchantController extends Controller
{
    public function dashboard(): Response
    {
        $sellerId = auth()->id();

        $totalListings = DB::table('listings')->where('merchant_id', $sellerId)->count();
        $totalOrders = DB::table('orders')->where('seller_id', $sellerId)->count();
        $totalPendingOrders = DB::table('orders')
            ->where('seller_id', $sellerId)
            ->where(function ($q) {
                $q->where('status', 'like', 'pending%');
            })
            ->count();

        if (request()->wantsJson()) {
            return response()->json([
                'metrics' => [
                    'total_orders' => $totalOrders,
                    'total_listings' => $totalListings,
                    'total_pending_orders' => $totalPendingOrders,
                ],
            ]);
        }

        return Inertia::render('Merchant/Dashboard', [
            'metrics' => [
                'total_orders' => $totalOrders,
                'total_listings' => $totalListings,
                'total_pending_orders' => $totalPendingOrders,
            ],
        ]);
    }
}
