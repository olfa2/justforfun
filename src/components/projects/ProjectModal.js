"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PROJECT_STATUSES } from "@/lib/constants";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

const COLORS = ["#378add", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

const emptyForm = {
  workspaceId: "",
  name: "",
  description: "",
  status: "active",
  color: COLORS[0],
  start_date: "",
  due_date: "",
};

function getInitialForm({ initialProject, workspaces, defaultWorkspaceId }) {
  if (initialProject) {
    return {
      workspaceId: initialProject.workspace_id || "",
      name: initialProject.name || "",
      description: initialProject.description || "",
      status: initialProject.status || "active",
      color: initialProject.color || COLORS[0],
      start_date: initialProject.start_date || "",
      due_date: initialProject.due_date || "",
    };
  }

  return {
    ...emptyForm,
    workspaceId: defaultWorkspaceId || workspaces[0]?.id || "",
  };
}

// Gemeinsames Modal zum Erstellen und Bearbeiten von Projekten.
export function ProjectModal(props) {
  if (!props.open) return null;

  const key = props.initialProject?.id || `new-${props.defaultWorkspaceId || ""}`;
  return <ProjectModalContent key={key} {...props} />;
}

function ProjectModalContent({
  onClose,
  onSubmit,
  onDelete,
  initialProject,
  workspaces = [],
  defaultWorkspaceId,
}) {
  const isEdit = Boolean(initialProject);
  const [form, setForm] = useState(() =>
    getInitialForm({ initialProject, workspaces, defaultWorkspaceId })
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await onSubmit(form);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    onClose?.();
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (
      !window.confirm(
        "Dieses Projekt wirklich löschen? Alle Aufgaben darin gehen verloren."
      )
    )
      return;
    setDeleting(true);
    const res = await onDelete();
    setDeleting(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    onClose?.();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Projekt bearbeiten" : "Neues Projekt"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && workspaces.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Workspace</label>
            <select
              value={form.workspaceId}
              onChange={(e) => update("workspaceId", e.target.value)}
              className={fieldClass}
              required
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="z. B. Website Relaunch"
            className={fieldClass}
            autoFocus
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Beschreibung</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Worum geht es in diesem Projekt?"
            rows={2}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className={fieldClass}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Farbe</label>
            <div className="flex items-center gap-1.5 pt-1.5">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => update("color", c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    form.color === c
                      ? "ring-2 ring-offset-2 ring-offset-card"
                      : ""
                  }`}
                  style={{ backgroundColor: c, "--tw-ring-color": c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fällig</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => update("due_date", e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Löschen
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Abbrechen
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Speichern" : "Projekt erstellen"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
