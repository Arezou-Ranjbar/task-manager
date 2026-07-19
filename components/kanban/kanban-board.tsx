"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { KanbanColumn } from "@/components/kanban/kanban-column";
import { TaskDialog } from "@/components/kanban/task-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMoveTask } from "@/hooks/use-tasks";
import { COLUMNS, PRIORITY_LABEL, type Task, type TaskStatus } from "@/types/task";

interface KanbanBoardProps {
  tasks: Task[];
}

export interface KanbanBoardHandle {
  openCreateDialog: (status?: TaskStatus) => void;
}

const COLUMN_IDS = COLUMNS.map((c) => c.id);

export const KanbanBoard = React.forwardRef<KanbanBoardHandle, KanbanBoardProps>(
  function KanbanBoard({ tasks }, ref) {
    const [activeTask, setActiveTask] = React.useState<Task | null>(null);
    const [editingTask, setEditingTask] = React.useState<Task | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [addStatus, setAddStatus] = React.useState<TaskStatus>("backlog");
    const moveTask = useMoveTask();

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 6 },
      }),
    );

    const tasksByColumn = React.useMemo(() => {
      const map: Record<TaskStatus, Task[]> = {
        backlog: [],
        todo: [],
        "in-progress": [],
        done: [],
      };
      for (const task of tasks) {
        map[task.status].push(task);
      }
      for (const status of COLUMN_IDS) {
        map[status].sort((a, b) => a.order - b.order);
      }
      return map;
    }, [tasks]);

    function findStatus(id: string): TaskStatus | undefined {
      if ((COLUMN_IDS as string[]).includes(id)) return id as TaskStatus;
      return tasks.find((t) => t.id === id)?.status;
    }

    function handleDragStart(event: DragStartEvent) {
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    }

    function handleDragEnd(event: DragEndEvent) {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const activeTaskData = tasks.find((t) => t.id === active.id);
      if (!activeTaskData) return;

      const targetStatus = findStatus(String(over.id));
      if (!targetStatus) return;

      const columnTasks = tasksByColumn[targetStatus].filter(
        (t) => t.id !== activeTaskData.id,
      );
      let targetIndex = columnTasks.length;

      if (over.id !== targetStatus) {
        const overIndex = columnTasks.findIndex((t) => t.id === over.id);
        if (overIndex !== -1) targetIndex = overIndex;
      }

      const currentColumnTasks = tasksByColumn[activeTaskData.status];
      const currentIndex = currentColumnTasks.findIndex(
        (t) => t.id === activeTaskData.id,
      );

      if (targetStatus === activeTaskData.status && targetIndex === currentIndex) {
        return;
      }

      moveTask.mutate({
        id: activeTaskData.id,
        status: targetStatus,
        index: targetIndex,
      });
    }

    function openCreateDialog(status: TaskStatus = "backlog") {
      setEditingTask(null);
      setAddStatus(status);
      setDialogOpen(true);
    }

    function openEditDialog(task: Task) {
      setEditingTask(task);
      setDialogOpen(true);
    }

    React.useImperativeHandle(ref, () => ({ openCreateDialog }), []);

    return (
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id]}
                onEdit={openEditDialog}
                onAdd={() => openCreateDialog(column.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <Card className="w-[280px] rotate-2 p-3 shadow-lg">
                <p className="text-sm font-medium leading-snug">{activeTask.title}</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="font-normal">
                    {PRIORITY_LABEL[activeTask.priority]}
                  </Badge>
                </div>
              </Card>
            )}
          </DragOverlay>
        </DndContext>

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
          defaultStatus={addStatus}
        />
      </>
    );
  },
);
