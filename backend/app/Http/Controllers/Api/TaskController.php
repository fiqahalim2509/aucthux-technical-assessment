<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function __construct(protected TaskService $taskService) {}

    /**
     * GET /api/tasks
     * Return a paginated list of tasks with optional status/priority filters.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['status', 'priority']);
        $perPage = (int) $request->get('per_page', 15);

        $tasks = $this->taskService->getTasks($filters, min($perPage, 100));

        return TaskResource::collection($tasks);
    }

    /**
     * POST /api/tasks
     * Create a new task. Rejects duplicates created within the last 10 seconds.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        try {
            $task = $this->taskService->createTask($request->validated());

            return (new TaskResource($task))
                ->response()
                ->setStatusCode(201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error'   => 'duplicate_task',
            ], 409);
        }
    }

    /**
     * PUT /api/tasks/{id}
     * Update an existing task.
     */
    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        try {
            $task = $this->taskService->updateTask($id, $request->validated());

            return (new TaskResource($task))
                ->response()
                ->setStatusCode(200);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error'   => 'not_found',
            ], 404);
        }
    }

    /**
     * DELETE /api/tasks/{id}
     * Delete a task by ID.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->taskService->deleteTask($id);

            return response()->json([
                'message' => 'Task deleted successfully.',
            ], 200);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error'   => 'not_found',
            ], 404);
        }
    }
}
