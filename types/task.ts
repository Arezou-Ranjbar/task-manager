export type TaskStatus = "backlog" | "todo" | "in-progress" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface Column {
  id: TaskStatus;
  title: string;
  description: string;
}

export const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog", description: "Not started yet" },
  { id: "todo", title: "To Do", description: "Ready to start" },
  { id: "in-progress", title: "In Progress", description: "Being worked on" },
  { id: "done", title: "Done", description: "Completed" },
];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
