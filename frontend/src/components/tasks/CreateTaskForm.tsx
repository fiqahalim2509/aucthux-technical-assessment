'use client';

import { ApiException } from '@/lib/api';
import { useCreateTask } from '@/hooks/useTasks';
import type { CreateTaskInput, TaskPriority } from '@/types/task';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
  general?: string;
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  priority: 'medium',
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.title.trim()) {
    errors.title = 'Title is required.';
  } else if (form.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  } else if (form.title.trim().length > 255) {
    errors.title = 'Title must not exceed 255 characters.';
  }

  if (form.description.length > 2000) {
    errors.description = 'Description must not exceed 2000 characters.';
  }

  return errors;
}

export default function CreateTaskForm() {
  const router = useRouter();
  const createTask = useCreateTask();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear field error as user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur for better UX
    const fieldErrors = validate(form);
    if (fieldErrors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name as keyof FormErrors] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ title: true, description: true, priority: true });
      return;
    }

    const input: CreateTaskInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
    };

    await createTask.mutateAsync(input, {
      onSuccess: () => {
        toast.success('Task created!');
        router.push('/tasks');
      },
      onError: (err: ApiException) => {
        if (err.status === 409) {
          // Duplicate task edge case
          setErrors({ general: err.message });
        } else if (err.status === 422 && err.data.errors) {
          // Map Laravel validation errors back to fields
          const mapped: FormErrors = {};
          for (const [key, messages] of Object.entries(err.data.errors)) {
            mapped[key as keyof FormErrors] = messages[0];
          }
          setErrors(mapped);
        } else {
          setErrors({ general: err.message });
        }
      },
    });
  }

  const isPending = createTask.isPending;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/tasks"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} />
        Back to tasks
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Create a new task</h1>

        {/* General error banner */}
        {errors.general && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Review pull request"
              disabled={isPending}
              className={clsx(
                'w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
                errors.title && touched.title
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-300',
              )}
            />
            {errors.title && touched.title && (
              <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
              Description{' '}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Add more context about this task..."
              disabled={isPending}
              className={clsx(
                'w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
                errors.description && touched.description
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-300',
              )}
            />
            <div className="mt-1 flex items-start justify-between">
              {errors.description && touched.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400">
                {form.description.length}/2000
              </span>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/tasks"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
