<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\OrderPaymentProof;
use App\Services\IdScanService;
use App\Services\FaceScanService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderPaymentProofController extends Controller
{
    // Submit payment proof (Buyer submits ONLY)
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'payment_reference' => ['required', 'string'],
            'id_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'receipt_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'face_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'id_image_url' => ['nullable', 'url'],
            'receipt_image_url' => ['nullable', 'url'],
            'face_image_url' => ['nullable', 'url'],
            'id_image_path' => ['nullable', 'string'],
            'receipt_image_path' => ['nullable', 'string'],
            'face_image_path' => ['nullable', 'string'],
        ]);

        $proof = null;
        DB::transaction(function () use (&$proof, $request) {
            $idPath = null;
            if ($request->hasFile('id_image')) {
                $idPath = $request->file('id_image')->store('ids/' . auth()->id(), 'public');
            } elseif ($request->filled('id_image_url')) {
                $idPath = $request->string('id_image_url')->toString();
            } elseif ($request->filled('id_image_path')) {
                $idPath = $request->string('id_image_path')->toString();
            }
            $receiptPath = null;
            if ($request->hasFile('receipt_image')) {
                $receiptPath = $request->file('receipt_image')->store('receipts/' . auth()->id(), 'public');
            } elseif ($request->filled('receipt_image_url')) {
                $receiptPath = $request->string('receipt_image_url')->toString();
            } elseif ($request->filled('receipt_image_path')) {
                $receiptPath = $request->string('receipt_image_path')->toString();
            }
            $facePath = null;
            if ($request->hasFile('face_image')) {
                $facePath = $request->file('face_image')->store('faces/' . auth()->id(), 'public');
            } elseif ($request->filled('face_image_url')) {
                $facePath = $request->string('face_image_url')->toString();
            } elseif ($request->filled('face_image_path')) {
                $facePath = $request->string('face_image_path')->toString();
            }
            $proof = OrderPaymentProof::create([
                'order_id' => (int) $request->input('order_id'),
                'payment_reference' => $request->string('payment_reference')->toString(),
                'id_image_path' => $idPath,
                'receipt_image_path' => $receiptPath,
                'face_image_path' => $facePath,
                'status' => 'pending',
            ]);
        });

        if ($proof->id_image_path) {
            $svc = new IdScanService();
            $res = $svc->submit($proof->id_image_path, auth()->id());
            $proof->update([
                'idscan_status' => $res['status'] ?? null,
                'idscan_provider' => $res['provider'] ?? null,
                'idscan_request_id' => $res['request_id'] ?? null,
                'idscan_result' => $res['result'] ?? null,
            ]);
        }

        if ($proof->face_image_path) {
            $svc2 = new FaceScanService();
            $res2 = $svc2->submit($proof->face_image_path, auth()->id());
            $proof->update([
                'facescan_status' => $res2['status'] ?? null,
                'facescan_provider' => $res2['provider'] ?? null,
                'facescan_request_id' => $res2['request_id'] ?? null,
                'facescan_result' => $res2['result'] ?? null,
            ]);
        }

        return response()->json($proof, 201);
    }

    // Review the payment proof (Admin/Midman)
    public function review(Request $request, int $id): JsonResponse
    {
        // Validate incoming data for reviewing the payment proof
        $request->validate([
            'status' => ['required', 'string'],
            'reviewed_by_id' => ['required', 'integer'], // ID of the user reviewing
            'reviewed_at' => ['required', 'date'],
            'review_notes' => ['nullable', 'string'], // Optional notes for review
        ]);

        // Find the payment proof by ID
        $proof = OrderPaymentProof::findOrFail($id);

        // Update the payment proof status and review details
        $proof->update([
            'status' => $request->status,
            'reviewed_by_id' => $request->reviewed_by_id,
            'reviewed_at' => $request->reviewed_at,
            'review_notes' => $request->review_notes,
        ]);

        // Return the updated proof details
        return response()->json($proof);
    }
}
