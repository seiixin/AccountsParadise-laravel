<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\OrderDelivery;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderDeliveryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'stage' => ['required', 'string'],
            'delivery_payload' => ['required'],
            'delivered_to_id' => ['required', 'exists:users,id'],
        ]);

        $delivery = OrderDelivery::create($data + [
            'delivered_by_id' => auth()->id(),
            'delivered_at' => now(),
        ]);

        return response()->json($delivery, 201);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'stage' => ['required', 'string'],
        ]);

        $delivery = OrderDelivery::findOrFail($id);
        $delivery->update([
            'stage' => $request->stage,
            'delivered_at' => now(),
        ]);

        return response()->json($delivery);
    }
}
