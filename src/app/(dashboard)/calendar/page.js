import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Placeholder } from "@/components/ui/Placeholder";
import { CreateWorkspaceButton } from "@/components/workspace/CreateWorkspaceButton";
import { CalendarView } from "@/components/calendar/CalendarView";
import { getWorkspaces, getActiveWorkspaceId } from "@/lib/workspace";
import { PRIO_META } from "@/lib/atlas";

export default async function CalendarPage() {
  const supabase = await createClient();
  const workspaces = await getWorkspaces(supabase);
  const activeWorkspaceId = await getActiveWorkspaceId(workspaces);

  if (!activeWorkspaceId) {
    return (
      <>
        <Header title="Kalender" description="Termine, Deadlines & Events" />
        <Placeholder
          icon={Calendar}
          title="Noch kein Workspace"
          description="Erstelle zuerst einen Workspace, um Termine zu planen."
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
  const projectMap = new Map(projectList.map((p) => [p.id, p]));

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("workspace_id", activeWorkspaceId);

  let tasks = [];
  if (projectList.length) {
    const ids = projectList.map((p) => p.id);
    const { data: tk } = await supabase
      .from("tasks")
      .select("id, title, due_date, priority, status, project_id")
      .in("project_id", ids)
      .not("due_date", "is", null);
    tasks = tk || [];
  }

  const eventItems = (events || []).map((e) => ({
    id: `e-${e.id}`,
    rawId: e.id,
    title: e.title,
    date: e.start_at,
    end: e.end_at,
    allDay: e.all_day,
    kind: "event",
    description: e.description,
    color: projectMap.get(e.project_id)?.color || "#8b8b93",
    projectId: e.project_id,
    projectName: projectMap.get(e.project_id)?.name || "",
  }));

  const taskItems = tasks
    .filter((t) => t.status !== "done")
    .map((t) => ({
      id: `t-${t.id}`,
      rawId: t.id,
      title: t.title,
      date: `${t.due_date}T12:00:00`,
      kind: "task",
      color: PRIO_META[t.priority]?.color || "var(--prio-medium)",
      projectId: t.project_id,
      projectName: projectMap.get(t.project_id)?.name || "",
    }));

  return (
    <CalendarView
      items={[...eventItems, ...taskItems]}
      projects={projectList}
      workspaceId={activeWorkspaceId}
    />
  );
}
