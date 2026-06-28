import Link from "next/link";
import { FolderKanban, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { NewProjectButton } from "@/components/projects/NewProjectButton";
import { CreateWorkspaceButton } from "@/components/workspace/CreateWorkspaceButton";
import { getWorkspaces, getActiveWorkspaceId } from "@/lib/workspace";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  const workspaces = await getWorkspaces(supabase);
  const activeWorkspaceId = await getActiveWorkspaceId(workspaces);

  let list = [];
  if (activeWorkspaceId) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", activeWorkspaceId)
      .order("created_at", { ascending: false });
    list = data || [];
  }

  const stats = [
    { label: "Projekte", value: list.length },
    { label: "Aktiv", value: list.filter((p) => p.status === "active").length },
    {
      label: "Pausiert",
      value: list.filter((p) => p.status === "on_hold").length,
    },
    {
      label: "Abgeschlossen",
      value: list.filter((p) => p.status === "completed").length,
    },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        description={name ? `Willkommen zurück, ${name}` : "Übersicht"}
      >
        {workspaces.length > 0 && (
          <NewProjectButton
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
          />
        )}
      </Header>

      <div className="space-y-8 p-6">
        {workspaces.length === 0 ? (
          // Onboarding: noch kein Workspace vorhanden
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
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
        ) : (
          <>
            {/* Kennzahlen */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="text-2xl font-semibold tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Projekte */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Deine Projekte</h2>
                {list.length > 0 && (
                  <Link
                    href="/projects"
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Alle anzeigen
                  </Link>
                )}
              </div>

              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-medium">Noch keine Projekte</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Lege über „Neues Projekt" dein erstes Projekt in diesem
                    Workspace an.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.slice(0, 6).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
