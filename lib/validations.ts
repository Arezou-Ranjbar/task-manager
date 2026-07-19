import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const taskStatusEnum = z.enum(["backlog", "todo", "in-progress", "done"]);
export const taskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(120, "Title must be under 120 characters."),
  description: z.string().max(2000, "Description is too long.").optional(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  tags: z.string().max(200, "Tags are too long.").optional(),
  dueDate: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
