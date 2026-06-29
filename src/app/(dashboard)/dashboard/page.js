import { Search, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewProjectButton } from "@/components/projects/NewProjectButton";
import { CreateWorkspaceButton } from "@/components/workspace/CreateWorkspaceButton";
import { getWorkspaces, getActiveWorkspaceId } from "@/lib/workspace";
import { buildDashboard } from "@/lib/dashboard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusDonutCard } from "@/components/dashboard/StatusDonutCard";
import { WeeklyActivityCard } from "@/components/dashboard/WeeklyActivityCard";
import { DeadlinesCard } from "@/components/dashboard/DeadlinesCard";
import { ProjectProgressCard } from "@/components/dashboard/ProjectProgressCard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  const workspaces = await getWorkspaces(supabase);
  const activeWorkspaceId = await getActiveWorkspaceId(workspaces);

  let projects = [];
  let tasks = [];
  if (activeWorkspaceId) {
    const { data: pr } = await supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", activeWorkspaceId);
    projects = pr || [];

    if (projects.length) {
      const ids = projects.map((p) => p.id);
      const { data: tk } = await supabase
        .from("tasks")
        .select("*")
        .in("project_id", ids);
      tasks = tk || [];
    }
  }

  const d = buildDashboard(projects, tasks);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-7 py-[18px] backdrop-blur">
        <div>
          <h1 className="text-[19px] font-semibold tracking-[-0.01em]">
            Übersicht
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {name ? `Willkommen zurück, ${name}` : "Dein Überblick"}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden h-[34px] w-[200px] items-center gap-2 rounded-[9px] border border-border bg-popover px-3 text-[13px] text-muted-foreground sm:flex">
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Suchen</span>
            <kbd className="rounded border border-border px-1.5 font-mono text-[11px]">
              ⌘K
            </kbd>
          </div>
          {workspaces.length > 0 && (
            <NewProjectButton
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
            />
          )}
        </div>
      </header>

      {workspaces.length === 0 ? (
        // Onboarding: noch kein Workspace
        <div className="p-7">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-popover text-muted-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold">
              Erstelle deinen ersten Workspace
            </h2>
            <p className="mb-5 mt-1 max-w-sm text-sm text-muted-foreground">
              Ein Workspace bündelt deine Projekte, Aufgaben und dein Team.
              Danach kannst du dein erstes Projekt anlegen.
            </p>
            <CreateWorkspaceButton label="Workspace erstellen" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[18px] px-7 py-6">
          {/* KPI-Reihe */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <KpiCard
              label="Aktive Projekte"
              value={d.kpis.activeProjects}
              delta={
                d.kpis.newActiveProjects > 0
                  ? `+${d.kpis.newActiveProjects}`
                  : null
              }
            />
            <KpiCard
              label="Offene Aufgaben"
              value={d.kpis.openTasks}
              delta={
                d.kpis.completedThisWeek > 0
                  ? `−${d.kpis.completedThisWeek}`
                  : null
              }
            />
            <KpiCard label="Fällig diese Woche" value={d.kpis.dueThisWeek} />
            <KpiCard
              label="Abschlussrate"
              value={d.kpis.completionRate}
              suffix="%"
            />
          </div>

          {/* Chart-Reihe */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.2fr_1fr]">
            <StatusDonutCard
              statusCounts={d.statusCounts}
              total={d.totalTasks}
              completionRate={d.kpis.completionRate}
            />
            <WeeklyActivityCard weekly={d.weekly} />
            <DeadlinesCard deadlines={d.deadlines} />
          </div>

          {/* Projektfortschritt */}
          <ProjectProgressCard progress={d.progress} />
        </div>
      )}
    </>
  );
}
