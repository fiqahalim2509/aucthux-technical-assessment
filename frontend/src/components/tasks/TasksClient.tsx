'use client';

import { useDeleteTask, useTasks, useUpdateTask } from '@/hooks/useTasks';
import type { Task, TaskFilters, TaskPriority, TaskStatus } from '@/types/task';
import { CheckCircle2, Circle, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Preahvihear } from 'next/font/google';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-sky-100 text-sky-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function TasksClient() {
  const [filters, setFilters] = useState<TaskFilters>({ page: 1 });

  const { data, isLoading, isError, error } = useTasks(filters);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  function handleStatusFilter(status: TaskStatus | '') {
    setFilters((prev) => ({ ...prev, status: status || undefined, page: 1 }));
  }

  function handlePriorityFilter(priority: TaskPriority | '') {
    setFilters((prev) => ({ ...prev, priority: priority || undefined, page: 1 }));
  }

  function handleSearch(search: string) {
    setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  async function handleToggleComplete(task: Task) {
    const next: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
    await updateTask.mutateAsync(
      { id: task.id, input: { status: next } },
      {
        onSuccess: () => toast.success(`Task marked as ${next}.`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;

    await deleteTask.mutateAsync(task.id, {
      onSuccess: () => toast.success('Task deleted.'),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">TaskFlow</h1>
            <p className="mt-1 text-sm text-slate-500">
              {data ? `${data.meta.total} tasks` : 'Loading...'}
            </p>
          </div>
          <Link
            href="/tasks/create"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <Plus size={16} />
            New Task
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Status
            </label>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={filters.status ?? ''}
              onChange={(e) => handleStatusFilter(e.target.value as TaskStatus | '')}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Priority
            </label>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={filters.priority ?? ''}
              onChange={(e) => handlePriorityFilter(e.target.value as TaskPriority | '')}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search tasks..."
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error?.message ?? 'Failed to load tasks. Please try again.'}
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">No tasks found.</p>
            <Link
              href="/tasks/create"
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              Create your first task →
            </Link>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <ul className="space-y-3">
              {data.data.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDelete}
                  isUpdating={updateTask.isPending}
                  isDeleting={deleteTask.isPending}
                />
              ))}
            </ul>

            {/* Pagination */}
            {data.meta.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={data.meta.current_page === 1}
                  onClick={() => handlePageChange(data.meta.current_page - 1)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {data.meta.current_page} of {data.meta.last_page}
                </span>
                <button
                  disabled={data.meta.current_page === data.meta.last_page}
                  onClick={() => handlePageChange(data.meta.current_page + 1)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const isCompleted = task.status === 'completed';

  return (
    <li className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Toggle complete button */}
      <button
        onClick={() => onToggle(task)}
        disabled={isUpdating}
        className="mt-0.5 shrink-0 text-slate-400 transition hover:text-brand-600 disabled:opacity-50"
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        {isCompleted ? (
          <CheckCircle2 size={22} className="text-emerald-500" />
        ) : (
          <Circle size={22} />
        )}
      </button>

      {/* Task content */}
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            'font-medium leading-snug',
            isCompleted ? 'text-slate-400 line-through' : 'text-slate-800',
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              PRIORITY_COLORS[task.priority],
            )}
          >
            {task.priority}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(task)}
        disabled={isDeleting}
        className="shrink-0 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
        aria-label="Delete task"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}
