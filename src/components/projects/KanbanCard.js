"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { TASK_PRIORITIES, getMeta } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

export function KanbanCard({ task, onClick, currentUser }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const priority = getMeta(TASK_PRIORITIES, task.priority);
  const assignedToMe = task.assignee_id && task.assignee_id === currentUser?.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group cursor-grab rounded-md border border-border bg-card p-3 transition-colors hover:border-accent/40 active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <p className="text-sm font-medium leading-snug">{task.title}</p>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <Badge variant={priority.badge}>{priority.label}</Badge>
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(task.due_date)}
            </span>
          )}
          {task.assignee_id &&
            (assignedToMe ? (
              <Avatar name={currentUser?.name} size="sm" />
            ) : (
              <Avatar name="?" size="sm" />
            ))}
        </div>
      </div>
    </div>
  );
}
