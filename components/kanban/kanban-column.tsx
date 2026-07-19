"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/kanban/task-card";
import { cn } from "@/lib/utils";
import type { Column, Task } from "@/types/task";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function KanbanColumn({ column, tasks, onEdit, onAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex w-[300px] shrink-0 flex-col rounded-lg bg-secondary/40 sm:w-[320px]">
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <div>
          <h2 className="font-display text-sm font-semibold">{column.title}</h2>
          <p className="text-xs text-muted-foreground">{column.description}</p>
        </div>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-md p-2 transition-colors",
          isOver && "column-drop-active bg-secondary/70",
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            Drop a task here
          </div>
        )}
      </div>

      <div className="p-2 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>
    </div>
  );
}
