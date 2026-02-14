<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ResolveDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(['open', 'under_review', 'resolved'])],
            'resolution' => [
                'nullable',
                'string',
                Rule::in(['refund_buyer', 'partial_refund', 'cancel_order', 'release_to_seller', 'other']),
            ],
            'decision_notes' => ['nullable', 'string', 'max:4000'],
        ];
    }
}
