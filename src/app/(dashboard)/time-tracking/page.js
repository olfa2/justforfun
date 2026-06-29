import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Placeholder } from "@/components/ui/Placeholder";
import { CreateWorkspaceButton } from "@/components/workspace/CreateWorkspaceButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TimerHero } from "@/components/time/TimerHero";
import { AddEntryButton } from "@/components/time/AddEntryButton";
import { ResumeButton } from "@/components/time/ResumeButton";
import { getWorkspaces, getActiveWorkspaceId } from "@/lib/workspace";
import { buildTimeStats } from "@/lib/time";
import { formatDuration, formatDate } from "@/lib/utils";

const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function deltaText(seconds) {
  if (!seconds) return null;
  return seconds > 0
    ? `+${formatDuration(seconds)}`
    : `−${formatDuration(-seconds)}`;
}

export default async function TimeTrackingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const workspaces = await getWorkspaces(supabase);
  const activeWorkspaceId = await getActiveWorkspaceId(workspaces);

  if (!activeWorkspaceId) {
    return (
      <>
        <Header title="Zeiterfassung" description="Timer und Zeiteinträge" />
        <Placeholder
          icon={Clock}
          title="Noch kein Workspace"
          description="Erstelle zuerst einen Workspace, um Zeiten zu erfassen."
        >
          <CreateWorkspaceButton label="Workspace erstellen" />
        </Placeholder>
      </>
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, color")
    .eq("workspace_id", activeWorkspaceId);
  const projectList = projects || [];
  const ids = projectList.map((p) => p.id);

  let tasks = [];
  let entries = [];
  if (ids.length) {
    const [{ data: tk }, { data: te }] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, project_id, status")
        .in("project_id", ids),
      supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", user.id)
        .in("project_id", ids)
        .order("started_at", { ascending: false }),
    ]);
    tasks = (tk || []).filter((t) => t.status !== "done");
    entries = te || [];
  }

  const stats = buildTimeStats(entries, projectList, tasks);

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-7 py-[18px] backdrop-blur">
        <div>
          <h1 className="text-[19px] font-semibold tracking-[-0.01em]">
            Zeiterfassung
          </h1>
          <p className="text-[13px] text-muted-foreground">Timer und Zeiteinträge</p>
        </div>
        <AddEntryButton tasks={tasks} projects={projectList} />
      </header>

      <div className="flex flex-col gap-[18px] px-7 py-6">
        <TimerHero running={stats.running} tasks={tasks} projects={projectList} />

        {/* KPI-Reihe */}
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiCard label="Heute" value={formatDuration(stats.kpis.today)} />
          <KpiCard
            label="Diese Woche"
            value={formatDuration(stats.kpis.week)}
            delta={deltaText(stats.kpis.weekDelta)}
          />
          <KpiCard
            label="Dieser Monat"
            value={formatDuration(stats.kpis.month)}
            delta={deltaText(stats.kpis.monthDelta)}
          />
          <KpiCard label="Abrechenbar" value={stats.kpis.billablePct} suffix="%" />
        </div>

        {/* Wochenchart + Projekt-Aufteilung */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[13px] font-semibold">Diese Woche</h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                Ziel 8h / Tag
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDuration(stats.kpis.week)} erfasst
            </p>

            <div className="mt-5 flex h-[150px] items-end gap-2">
              {stats.weekly.map((dd, i) => {
                const hrs = dd.seconds / 3600;
                const h = Math.min(100, (dd.seconds / (8 * 3600)) * 100);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      {hrs > 0 ? `${hrs.toFixed(1).replace(".", ",")}` : ""}
                    </span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="mx-auto w-full max-w-[38px] rounded-t-md"
                        style={{
                          height: `${Math.max(2, h)}%`,
                          backgroundColor: dd.isToday
                            ? "var(--accent)"
                            : "oklch(0.66 0.13 245)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {WD[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
            <h3 className="text-[13px] font-semibold">Nach Projekt</h3>
            {stats.byProject.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Noch keine erfasste Zeit.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {stats.byProject.map((p) => (
                  <li key={p.id} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[13px]">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: p.color || "var(--accent)" }}
                      />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="font-mono text-muted-foreground">
                        {formatDuration(p.seconds)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.pct}%`,
                          backgroundColor: p.color || "var(--accent)",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Letzte Einträge */}
        <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
          <h3 className="text-[13px] font-semibold">Letzte Einträge</h3>
          {stats.recent.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Noch keine Zeiteinträge. Starte oben einen Timer oder füge manuell
              einen Eintrag hinzu.
            </p>
          ) : (
            <ul className="mt-2">
              {stats.recent.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: e.color || "var(--accent)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] text-foreground">
                      {e.title}
                    </p>
                    <p className="truncate text-[11.5px] text-muted-foreground">
                      {e.project}
                    </p>
                  </div>
                  {e.billable && (
                    <span
                      className="hidden rounded-[5px] px-1.5 py-0.5 font-mono text-[10px] sm:inline"
                      style={{
                        color: "oklch(0.78 0.13 155)",
                        backgroundColor: "oklch(0.72 0.15 150 / 0.12)",
                      }}
                    >
                      Abrechenbar
                    </span>
                  )}
                  <span className="hidden w-[90px] shrink-0 text-right font-mono text-[12px] text-muted-foreground sm:block">
                    {formatDate(e.started_at)}
                  </span>
                  <span className="w-[64px] shrink-0 text-right font-mono text-[15px] font-semibold">
                    {formatDuration(e.seconds)}
                  </span>
                  <ResumeButton taskId={e.task_id} projectId={e.project_id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
