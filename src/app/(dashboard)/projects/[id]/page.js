import { FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Placeholder } from "@/components/ui/Placeholder";
import { ProjectBoard } from "@/components/projects/ProjectBoard";
import { EditProjectButton } from "@/components/projects/EditProjectButton";
import { PROJECT_STATUSES, getMeta } from "@/lib/constants";

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!project) {
    return (
      <>
        <Header title="Projekt nicht gefunden" />
        <Placeholder
          icon={FolderKanban}
          title="Projekt nicht gefunden"
          description="Dieses Projekt existiert nicht oder du hast keinen Zugriff darauf."
        />
      </>
    );
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  const status = getMeta(PROJECT_STATUSES, project.status);
  const currentUser = {
    id: user?.id,
    name:
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Ich",
  };

  return (
    <>
      <Header title={project.name} description={project.description || undefined}>
        <Badge variant={status.badge}>{status.label}</Badge>
        <EditProjectButton project={project} />
      </Header>
      <ProjectBoard
        project={project}
        initialTasks={tasks || []}
        currentUser={currentUser}
      />
    </>
  );
}
