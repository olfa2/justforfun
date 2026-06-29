"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createEvent } from "@/app/actions/events";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

function toDateInput(d) {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${day}`;
}

function initialForm(defaultDate, defaultTime) {
  return {
    title: "",
    date: toDateInput(defaultDate || new Date()),
    time: defaultTime || "09:00",
    allDay: false,
    projectId: "",
    description: "",
  };
}

export function EventModal(props) {
  if (!props.open) return null;

  const key = `${props.defaultDate?.toString() || ""}-${props.defaultTime || ""}`;
  return <EventModalContent key={key} {...props} />;
}

function EventModalContent({
  onClose,
  projects = [],
  workspaceId,
  defaultDate,
  defaultTime,
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialForm(defaultDate, defaultTime));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await createEvent({ ...form, workspaceId });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    onClose?.();
    router.refresh();
  }

  return (
    <Modal open onClose={onClose} title="Neuer Termin">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Titel</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="z. B. Kickoff-Meeting"
            className={fieldClass}
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Datum</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Uhrzeit</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className={fieldClass}
              disabled={form.allDay}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => update("allDay", e.target.checked)}
            className="accent-accent"
          />
          Ganztägig
        </label>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Projekt (optional)</label>
          <select
            value={form.projectId}
            onChange={(e) => update("projectId", e.target.value)}
            className={fieldClass}
          >
            <option value="">Kein Projekt</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notiz (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {error && (
          <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Termin erstellen
          </Button>
        </div>
      </form>
    </Modal>
  );
}
