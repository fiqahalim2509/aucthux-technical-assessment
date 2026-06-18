<?php

namespace App\Repositories;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class TaskRepository implements TaskRepositoryInterface
{
    public function __construct(protected Task $model) {}

    /**
     * Paginate tasks with optional filters.
     */
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->byStatus($filters['status'] ?? null)
            ->byPriority($filters['priority'] ?? null)
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $query->where(function ($q) use ($filters) {
                    $q->where('title', 'like', '%' .$filters['search'] . '%')
                        ->orWhere('description', 'like', '%' . $filters['search'] . '%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Find a task by ID.
     */
    public function findById(int $id): ?Task
    {
        return $this->model->find($id);
    }

    /**
     * Create a new task.
     */
    public function create(array $data): Task
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing task.
     */
    public function update(Task $task, array $data): Task
    {
        $task->update($data);

        return $task->fresh();
    }

    /**
     * Delete a task.
     */
    public function delete(Task $task): bool
    {
        return $task->delete();
    }

    /**
     * Check if a task with the same title was created within the given seconds.
     * Used to prevent duplicate submissions.
     */
    public function existsWithTitleWithinSeconds(string $title, int $seconds = 10): bool
    {
        $threshold = Carbon::now()->subSeconds($seconds);

        return $this->model
            ->where('title', $title)
            ->where('created_at', '>=', $threshold)
            ->exists();
    }
}