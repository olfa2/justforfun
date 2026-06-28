"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { Badge } from "@/components/ui/Badge";
import { TASK_STATUSES } from "@/lib/constants";
import { moveTask } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";

const STATUS_VALUES = TASK_STATUSES.map((s) => s.value);

export function KanbanBoard({ projectId, tasks, setTasks, onCardClick, onAdd, currentUser }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Tasks nach Status gruppiert und nach sort_order sortiert.
  const columns = useMemo(() => {
    const map = {};
    for (const s of STATUS_VALUES) map[s] = [];
    for (const t of tasks) {
      if (!map[t.status]) map[t.status] = [];
      map[t.status].push(t);
    }
    for (const s of Object.keys(map)) {
      map[s].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    return map;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  // Container (= Status) zu einer Drag-Id ermitteln.
  function findContainer(id) {
    if (STATUS_VALUES.includes(id)) return id;
    return tasks.find((t) => t.id === id)?.status;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  // Beim Hinüberziehen in eine andere Spalte: Status sofort optimistisch ändern.
  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === active.id ? { ...t, status: overContainer } : t
      )
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const dest = findContainer(over.id);
    if (!dest) return;

    const moved = tasks.find((t) => t.id === active.id);
    if (!moved) return;

    // Zielspalte ohne den verschobenen Task, sortiert.
    const destTasks = tasks
      .filter((t) => t.status === dest && t.id !== active.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    let overIndex = destTasks.findIndex((t) => t.id === over.id);
    if (overIndex === -1) overIndex = destTasks.length;

    const newOrder = [
      ...destTasks.slice(0, overIndex),
      moved,
      ...destTasks.slice(overIndex),
    ];
    const orderedIds = newOrder.map((t) => t.id);
    const orderMap = new Map(orderedIds.map((id, i) => [id, i]));

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === active.id)
          return { ...t, status: dest, sort_order: orderMap.get(t.id) };
        if (orderMap.has(t.id))
          return { ...t, sort_order: orderMap.get(t.id) };
        return t;
      })
    );

    // In Supabase persistieren (Status + neue Reihenfolge der Zielspalte).
    moveTask({ taskId: active.id, newStatus: dest, orderedIds });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            tasks={columns[status.value] || []}
            onCardClick={onCardClick}
            onAdd={onAdd}
            currentUser={currentUser}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-64 rotate-1 rounded-md border border-accent/50 bg-card p-3 shadow-2xl">
            <p className="text-sm font-medium leading-snug">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ status, tasks, onCardClick, onAdd, currentUser }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.value });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Badge variant={status.badge}>{status.label}</Badge>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAdd?.(status.value)}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
          title="Aufgabe hinzufügen"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] flex-1 flex-col gap-2 rounded-lg border border-transparent p-1 transition-colors",
          isOver && "border-accent/40 bg-card-hover/40"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onCardClick?.(task)}
              currentUser={currentUser}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <button
            onClick={() => onAdd?.(status.value)}
            className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
          >
            Aufgabe hinzufügen
          </button>
        )}
      </div>
    </div>
  );
}
