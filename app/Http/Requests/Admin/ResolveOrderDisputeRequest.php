<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ResolveOrderDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                Rule::in(['resolved', 'rejected', 'cancelled']),
            ],
            'resolution' => [
                'required',
                'string',
                Rule::in(['refund_buyer', 'release_to_seller', 'partial_refund', 'cancel_order', 'other']),
            ],
            'decision_notes' => ['nullable', 'string', 'max:4000'],
        ];
    }
}
