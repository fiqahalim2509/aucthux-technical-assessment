<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // GET /api/tasks
    // -------------------------------------------------------------------------

    public function test_can_list_all_tasks(): void
    {
        Task::factory()->count(3)->create();

        $response = $this->getJson('/api/tasks');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'title', 'description', 'status', 'priority', 'created_at', 'updated_at']],
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_can_filter_tasks_by_status(): void
    {
        Task::factory()->create(['status' => 'pending']);
        Task::factory()->create(['status' => 'completed']);

        $response = $this->getJson('/api/tasks?status=pending');

        $response->assertOk();

        collect($response->json('data'))->each(
            fn ($task) => $this->assertEquals('pending', $task['status'])
        );
    }

    // -------------------------------------------------------------------------
    // POST /api/tasks
    // -------------------------------------------------------------------------

    public function test_can_create_a_task(): void
    {
        $payload = [
            'title'       => 'My first task',
            'description' => 'A description',
            'priority'    => 'high',
        ];

        $response = $this->postJson('/api/tasks', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'My first task')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.priority', 'high');

        $this->assertDatabaseHas('tasks', ['title' => 'My first task']);
    }

    public function test_create_task_requires_title(): void
    {
        $response = $this->postJson('/api/tasks', ['description' => 'No title']);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }

    public function test_create_task_rejects_duplicate_title_within_10_seconds(): void
    {
        $payload = ['title' => 'Duplicate Task'];

        $this->postJson('/api/tasks', $payload)->assertCreated();

        // Immediate second request — should be rejected
        $this->postJson('/api/tasks', $payload)
            ->assertStatus(409)
            ->assertJsonPath('error', 'duplicate_task');
    }

    // -------------------------------------------------------------------------
    // PUT /api/tasks/{id}
    // -------------------------------------------------------------------------

    public function test_can_update_a_task(): void
    {
        $task = Task::factory()->create(['status' => 'pending']);

        $response = $this->putJson("/api/tasks/{$task->id}", ['status' => 'completed']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'completed']);
    }

    public function test_update_returns_404_for_missing_task(): void
    {
        $this->putJson('/api/tasks/99999', ['status' => 'completed'])
            ->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // DELETE /api/tasks/{id}
    // -------------------------------------------------------------------------

    public function test_can_delete_a_task(): void
    {
        $task = Task::factory()->create();

        $this->deleteJson("/api/tasks/{$task->id}")->assertOk();

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_delete_returns_404_for_missing_task(): void
    {
        $this->deleteJson('/api/tasks/99999')->assertNotFound();
    }
}
