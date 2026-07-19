"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { BoardToolbar, type PriorityFilter } from "@/components/kanban/board-toolbar";
import { KanbanBoard, type KanbanBoardHandle } from "@/components/kanban/kanban-board";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useTasks } from "@/hooks/use-tasks";

function DashboardContent() {
  const { data: tasks, isLoading, isError, refetch } = useTasks();
  const [search, setSearch] = React.useState("");
  const [priority, setPriority] = React.useState<PriorityFilter>("all");
  const [tag, setTag] = React.useState("all");
  const boardRef = React.useRef<KanbanBoardHandle>(null);

  const debouncedSearch = useDebounce(search, 200);

  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    for (const task of tasks ?? []) {
      task.tags.forEach((t) => tagSet.add(t));
    }
    return Array.from(tagSet).sort();
  }, [tasks]);

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    const query = debouncedSearch.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false) ||
        task.tags.some((t) => t.toLowerCase().includes(query));

      const matchesPriority = priority === "all" || task.priority === priority;
      const matchesTag = tag === "all" || task.tags.includes(tag);

      return matchesSearch && matchesPriority && matchesTag;
    });
  }, [tasks, debouncedSearch, priority, tag]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6">
        <BoardToolbar
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          tag={tag}
          onTagChange={setTag}
          availableTags={availableTags}
          onNewTask={() => boardRef.current?.openCreateDialog()}
          resultCount={filteredTasks.length}
          totalCount={tasks?.length ?? 0}
        />

        {isLoading && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] w-[300px] shrink-0 sm:w-[320px]" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-medium">Couldn&apos;t load your tasks</p>
              <p className="text-sm text-muted-foreground">
                Something went wrong talking to the task service.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && <KanbanBoard ref={boardRef} tasks={filteredTasks} />}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
