"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Loader2 } from "lucide-react";
import { startTimer, stopTimer } from "@/app/actions/timeEntries";

function fmtHMS(total) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(total / 3600))}:${p(Math.floor((total % 3600) / 60))}:${p(
    total % 60
  )}`;
}

export function TimerHero({ running, tasks = [], projects = [] }) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!running) return;
    const start = new Date(running.started_at).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [running]);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  async function handleStart() {
    setError("");
    const t = tasks.find((x) => x.id === taskId);
    if (!t) {
      setError("Bitte eine Aufgabe wählen.");
      return;
    }
    setBusy(true);
    const res = await startTimer({ taskId: t.id, projectId: t.project_id });
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  async function handleStop() {
    setBusy(true);
    await stopTimer();
    setBusy(false);
    router.refresh();
  }

  if (running) {
    return (
      <div
        className="flex flex-col items-start gap-5 rounded-2xl border border-accent/25 p-6 sm:flex-row sm:items-center"
        style={{
          background:
            "linear-gradient(100deg, color-mix(in oklab, var(--accent) 10%, transparent), var(--card) 60%)",
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-done opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-done" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wide text-status-done">
              Läuft
            </span>
          </div>
          <h2 className="mt-2 text-lg font-semibold">{running.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: running.color || "var(--accent)" }}
            />
            {running.project || "Ohne Projekt"}
          </div>
        </div>

        <div className="font-mono text-[40px] font-semibold tracking-tight sm:text-[46px]">
          {fmtHMS(elapsed)}
        </div>

        <button
          onClick={handleStop}
          disabled={busy}
          className="inline-flex h-12 items-center gap-2 rounded-xl px-5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "oklch(0.62 0.21 18)" }}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-4 w-4" fill="currentColor" />
          )}
          Stoppen
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        Kein Timer aktiv
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Aufgabe wählen …</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {projectMap.get(t.project_id)?.name
                ? `${projectMap.get(t.project_id).name} · ${t.title}`
                : t.title}
            </option>
          ))}
        </select>
        <button
          onClick={handleStart}
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Timer starten
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {tasks.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Lege zuerst eine Aufgabe an, um einen Timer zu starten.
        </p>
      )}
    </div>
  );
}
