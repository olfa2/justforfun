"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { addManualEntry } from "@/app/actions/timeEntries";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

function todayInput() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function AddEntryButton({ tasks = [], projects = [] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    taskId: "",
    date: todayInput(),
    hours: "",
    minutes: "",
    description: "",
    billable: true,
  });

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.project_id === form.projectId),
    [tasks, form.projectId]
  );

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await addManualEntry(form);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setOpen(false);
    setForm((f) => ({ ...f, hours: "", minutes: "", description: "" }));
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Eintrag hinzufügen
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Zeiteintrag hinzufügen">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Projekt</label>
            <select
              value={form.projectId}
              onChange={(e) => {
                update("projectId", e.target.value);
                update("taskId", "");
              }}
              className={fieldClass}
              required
            >
              <option value="">Projekt wählen …</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Aufgabe (optional)</label>
            <select
              value={form.taskId}
              onChange={(e) => update("taskId", e.target.value)}
              className={fieldClass}
              disabled={!form.projectId}
            >
              <option value="">Keine Aufgabe</option>
              {projectTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Datum</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Stunden</label>
              <input
                type="number"
                min="0"
                value={form.hours}
                onChange={(e) => update("hours", e.target.value)}
                placeholder="0"
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Minuten</label>
              <input
                type="number"
                min="0"
                max="59"
                value={form.minutes}
                onChange={(e) => update("minutes", e.target.value)}
                placeholder="0"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notiz (optional)</label>
            <input
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Woran hast du gearbeitet?"
              className={fieldClass}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.billable}
              onChange={(e) => update("billable", e.target.checked)}
              className="accent-accent"
            />
            Abrechenbar
          </label>

          {error && (
            <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Hinzufügen
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
