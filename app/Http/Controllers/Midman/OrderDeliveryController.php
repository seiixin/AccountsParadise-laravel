<?php

namespace App\Http\Controllers\Midman;

use App\Http\Controllers\Controller;
use App\Models\OrderDelivery;
use Illuminate\Http\JsonResponse;

class OrderDeliveryController extends Controller
{
    public function receive(int $id): JsonResponse
    {
        $delivery = OrderDelivery::findOrFail($id);

        $delivery->update([
            'stage' => 'received_by_midman',
            'received_at' => now(),
            'received_by_id' => auth()->id(),
        ]);

        return response()->json($delivery);
    }

    public function deliver(int $id): JsonResponse
    {
        $delivery = OrderDelivery::findOrFail($id);

        $delivery->update([
            'stage' => 'delivered_to_buyer',
            'delivered_at' => now(),
            'delivered_to_id' => $delivery->order->buyer_id ?? null,
        ]);

        return response()->json($delivery);
    }
}
