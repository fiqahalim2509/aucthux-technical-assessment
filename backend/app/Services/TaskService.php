<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskService
{
    public function __construct(
        protected TaskRepositoryInterface $taskRepository
    ) {}

    /**
     * Get a paginated list of tasks with optional filters.
     */
    public function getTasks(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->taskRepository->paginate($filters, $perPage);
    }

    /**
     * Create a new task after checking for duplicates.
     *
     * @throws \RuntimeException
     */
    public function createTask(array $data): Task
    {
        if ($this->taskRepository->existsWithTitleWithinSeconds($data['title'], 10)) {
            throw new \RuntimeException(
                'A task with this title was already created in the last 10 seconds. Please wait before creating a duplicate.'
            );
        }

        return $this->taskRepository->create($data);
    }

    /**
     * Update an existing task.
     *
     * @throws \RuntimeException
     */
    public function updateTask(int $id, array $data): Task
    {
        $task = $this->taskRepository->findById($id);

        if (! $task) {
            throw new \RuntimeException("Task with ID {$id} not found.");
        }

        return $this->taskRepository->update($task, $data);
    }

    /**
     * Delete a task by ID.
     *
     * @throws \RuntimeException
     */
    public function deleteTask(int $id): bool
    {
        $task = $this->taskRepository->findById($id);

        if (! $task) {
            throw new \RuntimeException("Task with ID {$id} not found.");
        }

        return $this->taskRepository->delete($task);
    }
}
