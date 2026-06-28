"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

const emptyForm = {
  title: "",
  description: "",
  status: "backlog",
  priority: "medium",
  assignee_id: "",
  due_date: "",
};

export function TaskModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  initialTask,
  defaultStatus,
  currentUser,
}) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialTask);

  // Formular beim Öffnen mit den Task-Daten (oder Defaults) füllen.
  useEffect(() => {
    if (!open) return;
    setError("");
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "backlog",
        priority: initialTask.priority || "medium",
        assignee_id: initialTask.assignee_id || "",
        due_date: initialTask.due_date || "",
      });
    } else {
      setForm({ ...emptyForm, status: defaultStatus || "backlog" });
    }
  }, [open, initialTask, defaultStatus]);

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
    setDeleting(true);
    const res = await onDelete();
    setDeleting(false);
    if (res?.error) setError(res.error);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Titel</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Was ist zu tun?"
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
            placeholder="Details (optional)"
            rows={3}
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
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Priorität</label>
            <select
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
              className={fieldClass}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Zuständig</label>
            <select
              value={form.assignee_id}
              onChange={(e) => update("assignee_id", e.target.value)}
              className={fieldClass}
            >
              <option value="">Niemand</option>
              <option value={currentUser?.id || ""}>
                Mir zuweisen
              </option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fällig am</label>
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
            {isEdit && (
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
              {isEdit ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
