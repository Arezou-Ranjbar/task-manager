"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { taskService } from "@/services/taskService";
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: taskService.list,
    staleTime: 1000 * 30,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.create(input),
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(taskKeys.all, (old) => [...(old ?? []), task]);
      toast.success("Task created", { description: task.title });
    },
    onError: (error: Error) => {
      toast.error("Couldn't create task", { description: error.message });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.update(id, input),
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(taskKeys.all, (old) =>
        (old ?? []).map((t) => (t.id === task.id ? task : t)),
      );
      toast.success("Task updated", { description: task.title });
    },
    onError: (error: Error) => {
      toast.error("Couldn't update task", { description: error.message });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.all);
      queryClient.setQueryData<Task[]>(taskKeys.all, (old) =>
        (old ?? []).filter((t) => t.id !== id),
      );
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.all, context.previous);
      }
      toast.error("Couldn't delete task", { description: error.message });
    },
    onSuccess: () => {
      toast.success("Task deleted");
    },
  });
}

/**
 * Optimistically moves a task between/within columns for instant drag & drop
 * feedback, then reconciles with the persisted result from the fake API.
 */
export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      index,
    }: {
      id: string;
      status: TaskStatus;
      index: number;
    }) => taskService.move(id, status, index),
    onMutate: async ({ id, status, index }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.all);

      if (previous) {
        const task = previous.find((t) => t.id === id);
        if (task) {
          const remaining = previous.filter((t) => t.id !== id);
          const columnTasks = remaining
            .filter((t) => t.status === status)
            .sort((a, b) => a.order - b.order);
          const movedTask = { ...task, status };
          columnTasks.splice(index, 0, movedTask);
          const reindexed = columnTasks.map((t, i) => ({ ...t, order: i }));
          const others = remaining.filter((t) => t.status !== status);
          queryClient.setQueryData<Task[]>(taskKeys.all, [...others, ...reindexed]);
        }
      }

      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.all, context.previous);
      }
      toast.error("Couldn't move task");
    },
    onSuccess: (tasks) => {
      queryClient.setQueryData(taskKeys.all, tasks);
    },
  });
}
