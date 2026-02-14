<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPaymentProof;
use App\Services\IdScanService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'listing_id' => ['required', 'integer'],
            'payment_method' => ['required', 'string'],
            'payment_reference' => ['required', 'string'],
            'id_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,ico', 'max:10240'],
            'receipt_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $listing = DB::table('listings')
            ->select(['id', 'merchant_id', 'title', 'type', 'price', 'currency'])
            ->find((int) $request->input('listing_id'));

        abort_unless($listing, 404);

        $currency = $listing->currency;
        if (!$currency || trim((string) $currency) === '') {
            $currency = 'PHP';
        }

        $orderNo = null;
        do {
            $orderNo = 'ORD-' . date('Y') . '-' . strtoupper(Str::random(8));
        } while (Order::where('order_no', $orderNo)->exists());

        $order = null;
        $proof = null;
        $idPathOut = null;
        DB::transaction(function () use (&$order, &$proof, &$idPathOut, $listing, $currency, $request, $orderNo) {
            $order = Order::create([
                'order_no' => $orderNo,
                'status' => 'pending_verification',
                'buyer_id' => auth()->id(),
                'seller_id' => $listing->merchant_id,
                'amount' => $listing->price,
                'currency' => $currency,
                'listing_title_snapshot' => $listing->title,
                'listing_type_snapshot' => $listing->type,
                'game_snapshot' => null,
            ]);

            $idPath = null;
            if ($request->hasFile('id_image')) {
                $idPath = $request->file('id_image')->store('ids/' . auth()->id(), 'public');
            }
            $receiptPath = null;
            if ($request->hasFile('receipt_image')) {
                $receiptPath = $request->file('receipt_image')->store('receipts/' . auth()->id(), 'public');
            }

            $proof = OrderPaymentProof::create([
                'order_id' => $order->id,
                'payment_reference' => $request->string('payment_reference')->toString(),
                'id_image_path' => $idPath,
                'receipt_image_path' => $receiptPath,
                'status' => 'pending',
            ]);
            $idPathOut = $idPath;
        });

        if ($idPathOut) {
            $svc = new IdScanService();
            $res = $svc->submit($idPathOut, auth()->id());
            $proof->update([
                'idscan_status' => $res['status'] ?? null,
                'idscan_provider' => $res['provider'] ?? null,
                'idscan_request_id' => $res['request_id'] ?? null,
                'idscan_result' => $res['result'] ?? null,
            ]);
        }

        return response()->json([
            'order' => $order,
            'payment_proof_status' => 'pending',
        ], 201);
    }
}
