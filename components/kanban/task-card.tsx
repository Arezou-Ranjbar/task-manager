"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTask } from "@/hooks/use-tasks";
import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import { PRIORITY_LABEL, type Task } from "@/types/task";

const PRIORITY_DOT: Record<Task["priority"], string> = {
  low: "bg-muted-foreground/50",
  medium: "bg-primary",
  high: "bg-warning",
  urgent: "bg-destructive",
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const deleteTask = useDeleteTask();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { task },
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = formatDueDate(task.dueDate);
  const overdue = isOverdue(task.dueDate) && task.status !== "done";

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative touch-none p-3 shadow-sm transition-shadow hover:shadow-md",
          isDragging && "task-card-dragging",
        )}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none text-muted-foreground/60 hover:text-muted-foreground active:cursor-grabbing"
            aria-label="Drag task"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">{task.title}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="gap-1 font-normal">
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[task.priority])}
                />
                {PRIORITY_LABEL[task.priority]}
              </Badge>
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
              {due && (
                <span
                  className={cn(
                    "ml-auto flex items-center gap-1 text-xs",
                    overdue ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="h-3 w-3" />
                  {due}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{task.title}&rdquo; will be permanently removed. This can&apos;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTask.mutate(task.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
