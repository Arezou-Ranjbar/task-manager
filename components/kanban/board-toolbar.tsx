"use client";

import * as React from "react";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_LABEL, type TaskPriority } from "@/types/task";

export type PriorityFilter = "all" | TaskPriority;

interface BoardToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  priority: PriorityFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  tag: string;
  onTagChange: (value: string) => void;
  availableTags: string[];
  onNewTask: () => void;
  resultCount: number;
  totalCount: number;
}

export function BoardToolbar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  tag,
  onTagChange,
  availableTags,
  onNewTask,
  resultCount,
  totalCount,
}: BoardToolbarProps) {
  const hasActiveFilters = search.length > 0 || priority !== "all" || tag !== "all";

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Your board
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? `Showing ${resultCount} of ${totalCount} tasks`
              : `${totalCount} tasks across all columns`}
          </p>
        </div>
        <Button onClick={onNewTask} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="pl-8"
            aria-label="Search tasks"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          value={priority}
          onValueChange={(v) => onPriorityChange(v as PriorityFilter)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tag} onValueChange={onTagChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {availableTags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange("");
              onPriorityChange("all");
              onTagChange("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
