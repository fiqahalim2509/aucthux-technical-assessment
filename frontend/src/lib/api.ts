import type {
  ApiError,
  CreateTaskInput,
  PaginatedResponse,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public data: ApiError,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}/api${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiException(
      data.message ?? 'An unexpected error occurred.',
      response.status,
      data as ApiError,
    );
  }

  return data as T;
}

// ─── Task endpoints ───────────────────────────────────────────────────────────

export function buildTasksUrl(filters: TaskFilters): string {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.per_page) params.set('per_page', String(filters.per_page));

  const query = params.toString();
  return query ? `/tasks?${query}` : '/tasks';
}

export const taskApi = {
  list: (filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> =>
    request<PaginatedResponse<Task>>(buildTasksUrl(filters)),

  create: (input: CreateTaskInput): Promise<{ data: Task }> =>
    request<{ data: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: number, input: UpdateTaskInput): Promise<{ data: Task }> =>
    request<{ data: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiException };
