<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, ?string $status): mixed
    {
        if ($status && in_array($status, ['pending', 'completed'])) {
            return $query->where('status', $status);
        }

        return $query;
    }

    /**
     * Scope a query to filter by priority.
     */
    public function scopeByPriority($query, ?string $priority): mixed
    {
        if ($priority && in_array($priority, ['low', 'medium', 'high'])) {
            return $query->where('priority', $priority);
        }

        return $query;
    }
}
