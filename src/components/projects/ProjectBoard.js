"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { KanbanBoard } from "./KanbanBoard";
import { ListView } from "./ListView";
import { TaskModal } from "./TaskModal";
import { createTask, updateTask, deleteTask } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";

// Client-Wrapper der Projekt-Detailseite: hält den Task-State, schaltet zwischen
// Kanban/Liste um und steuert das Task-Modal.
export function ProjectBoard({ project, initialTasks, currentUser }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [view, setView] = useState("kanban");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("backlog");

  function openNew(status = "backlog") {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSubmit(formValues) {
    if (editingTask) {
      const res = await updateTask(editingTask.id, {
        ...formValues,
        projectId: project.id,
      });
      if (res?.error) return res;
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? res.data : t))
      );
      return { data: res.data };
    }
    const res = await createTask({ ...formValues, projectId: project.id });
    if (res?.error) return res;
    setTasks((prev) => [...prev, res.data]);
    return { data: res.data };
  }

  async function handleDelete() {
    if (!editingTask) return;
    const res = await deleteTask(editingTask.id, project.id);
    if (res?.error) return res;
    setTasks((prev) => prev.filter((t) => t.id !== editingTask.id));
    setModalOpen(false);
    return { ok: true };
  }

  return (
    <>
      {/* Toolbar: View-Toggle + neue Aufgabe */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div className="inline-flex rounded-md border border-border p-0.5">
          <ViewButton
            active={view === "kanban"}
            onClick={() => setView("kanban")}
            icon={LayoutGrid}
            label="Kanban"
          />
          <ViewButton
            active={view === "list"}
            onClick={() => setView("list")}
            icon={List}
            label="Liste"
          />
        </div>

        <Button size="sm" onClick={() => openNew()}>
          <Plus className="h-4 w-4" />
          Neue Aufgabe
        </Button>
      </div>

      {/* Inhalt */}
      <div className="flex-1 overflow-auto p-6">
        {view === "kanban" ? (
          <KanbanBoard
            projectId={project.id}
            tasks={tasks}
            setTasks={setTasks}
            onCardClick={openEdit}
            onAdd={openNew}
            currentUser={currentUser}
          />
        ) : (
          <ListView
            tasks={tasks}
            onRowClick={openEdit}
            currentUser={currentUser}
          />
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        initialTask={editingTask}
        defaultStatus={defaultStatus}
        currentUser={currentUser}
      />
    </>
  );
}

function ViewButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-card-hover text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
