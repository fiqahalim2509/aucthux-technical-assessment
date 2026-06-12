import { ApiException, taskApi } from '@/lib/api';
import type {
  CreateTaskInput,
  PaginatedResponse,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '@/types/task';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// ─── Query keys ──────────────────────────────────────────────────────────────

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useTasks(filters: TaskFilters = {}) {
  return useQuery<PaginatedResponse<Task>, ApiException>({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskApi.list(filters),
    staleTime: 30_000, // 30 seconds
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Task }, ApiException, CreateTaskInput>({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<
    { data: Task },
    ApiException,
    { id: number; input: UpdateTaskInput }
  >({
    mutationFn: ({ id, input }) => taskApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiException, number>({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
