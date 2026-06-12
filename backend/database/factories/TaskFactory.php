<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'title'       => $this->faker->sentence(4),
            'description' => $this->faker->optional(0.7)->paragraph(),
            'status'      => $this->faker->randomElement(['pending', 'completed']),
            'priority'    => $this->faker->randomElement(['low', 'medium', 'high']),
        ];
    }

    /**
     * Mark the task as pending.
     */
    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending']);
    }

    /**
     * Mark the task as completed.
     */
    public function completed(): static
    {
        return $this->state(fn () => ['status' => 'completed']);
    }
}
