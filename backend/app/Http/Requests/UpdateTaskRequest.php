<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status'      => ['sometimes', 'in:pending,completed'],
            'priority'    => ['sometimes', 'in:low,medium,high'],
        ];
    }

    /**
     * Get human-readable attribute names.
     */
    public function attributes(): array
    {
        return [
            'title'       => 'task title',
            'description' => 'description',
            'status'      => 'status',
            'priority'    => 'priority',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.min'   => 'The task title must be at least 3 characters.',
            'title.max'   => 'The task title may not exceed 255 characters.',
            'status.in'   => 'Status must be either "pending" or "completed".',
            'priority.in' => 'Priority must be "low", "medium", or "high".',
        ];
    }
}
