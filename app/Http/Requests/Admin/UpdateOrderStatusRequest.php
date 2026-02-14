<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guard via middleware/policies
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                Rule::in([
                    'pending',
                    'paid',
                    'processing',
                    'delivered',
                    'completed',
                    'cancelled',
                    'disputed',
                    'refunded',
                ]),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
