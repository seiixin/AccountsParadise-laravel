<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\OrderPaymentProof;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderPaymentProofController extends Controller
{
    // Submit payment proof (Buyer submits ONLY)
    public function store(Request $request): JsonResponse
    {
        // Validate incoming data
        $data = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'payment_reference' => ['required', 'string'],
            'id_image_path' => ['nullable', 'string'],
            'receipt_image_path' => ['nullable', 'string'],
        ]);

        // Create a new order payment proof
        $proof = OrderPaymentProof::create($data + [
            'status' => 'pending',  // Default status
            'created_at' => now(),
        ]);

        // Return a response with the created proof
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
