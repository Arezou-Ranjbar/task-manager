import { v4 as uuid } from "uuid";

import { FAKE_LATENCY_MS, TASKS_STORAGE_KEY } from "@/lib/constants";
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "@/types/task";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedTasks(): Task[] {
  const now = new Date().toISOString();
  const base: Array<Omit<Task, "id" | "createdAt" | "updatedAt">> = [
    {
      title: "Define product roadmap for Q3",
      description: "Align with stakeholders on priorities for the next quarter.",
      status: "backlog",
      priority: "medium",
      tags: ["planning"],
      dueDate: null,
      order: 0,
    },
    {
      title: "Set up CI/CD pipeline",
      description: "Automate build, lint, and test steps on every pull request.",
      status: "backlog",
      priority: "low",
      tags: ["infra"],
      dueDate: null,
      order: 1,
    },
    {
      title: "Design the kanban board UI",
      description: "Explore layout options for columns, cards, and drag handles.",
      status: "todo",
      priority: "high",
      tags: ["design"],
      dueDate: null,
      order: 0,
    },
    {
      title: "Write onboarding docs",
      description: "Draft a short guide for new teammates joining the project.",
      status: "todo",
      priority: "low",
      tags: ["docs"],
      dueDate: null,
      order: 1,
    },
    {
      title: "Implement drag & drop",
      description: "Wire up dnd-kit so cards can move between columns smoothly.",
      status: "in-progress",
      priority: "urgent",
      tags: ["frontend"],
      dueDate: null,
      order: 0,
    },
    {
      title: "Build task creation form",
      description: "Validate inputs with Zod and React Hook Form.",
      status: "in-progress",
      priority: "high",
      tags: ["frontend"],
      dueDate: null,
      order: 1,
    },
    {
      title: "Project scaffolding",
      description: "Initialize Next.js, Tailwind, and shadcn/ui.",
      status: "done",
      priority: "medium",
      tags: ["infra"],
      dueDate: null,
      order: 0,
    },
  ];

  return base.map((task) => ({
    ...task,
    id: uuid(),
    createdAt: now,
    updatedAt: now,
  }));
}

function readAll(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      const seeded = seedTasks();
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function writeAll(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export const taskService = {
  async list(): Promise<Task[]> {
    await delay(FAKE_LATENCY_MS);
    return readAll().sort((a, b) => a.order - b.order);
  },

  async create(input: CreateTaskInput): Promise<Task> {
    await delay(FAKE_LATENCY_MS);
    const tasks = readAll();
    const now = new Date().toISOString();
    const siblingCount = tasks.filter((t) => t.status === input.status).length;

    const task: Task = {
      id: uuid(),
      title: input.title,
      description: input.description ?? "",
      status: input.status,
      priority: input.priority,
      tags: input.tags,
      dueDate: input.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
      order: siblingCount,
    };

    writeAll([...tasks, task]);
    return task;
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    await delay(FAKE_LATENCY_MS);
    const tasks = readAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Task not found.");

    const existing = tasks[index]!;
    const updated: Task = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    writeAll(tasks);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay(FAKE_LATENCY_MS);
    const tasks = readAll().filter((t) => t.id !== id);
    writeAll(tasks);
  },

  /**
   * Moves a task to a new status/column and position, reindexing the
   * `order` field of every affected task so drag & drop stays consistent.
   */
  async move(id: string, status: TaskStatus, index: number): Promise<Task[]> {
    await delay(150);
    const tasks = readAll();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) throw new Error("Task not found.");

    const task = tasks[taskIndex]!;
    const remaining = tasks.filter((t) => t.id !== id);
    const columnTasks = remaining
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

    const movedTask: Task = { ...task, status, updatedAt: new Date().toISOString() };
    columnTasks.splice(index, 0, movedTask);

    const reindexedColumn = columnTasks.map((t, i) => ({ ...t, order: i }));
    const others = remaining.filter((t) => t.status !== status);

    const next = [...others, ...reindexedColumn];
    writeAll(next);
    return next;
  },
};
