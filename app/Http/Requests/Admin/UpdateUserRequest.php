<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = (int) $this->route('id');

        return [
            'name' => ['required', 'string', 'max:120'],
            'username' => [
                'required',
                'string',
                'max:60',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required',
                'email',
                'max:190',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'role' => ['required', 'string', Rule::in(['admin', 'buyer', 'merchant', 'midman'])],
        ];
    }
}
