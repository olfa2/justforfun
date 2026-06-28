import { FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Placeholder } from "@/components/ui/Placeholder";
import { NewProjectButton } from "@/components/projects/NewProjectButton";
import { CreateWorkspaceButton } from "@/components/workspace/CreateWorkspaceButton";
import { getWorkspaces, getActiveWorkspaceId } from "@/lib/workspace";

export default async function ProjectsPage() {
  const supabase = await createClient();

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

  return (
    <>
      <Header title="Projekte" description="Projekte im aktiven Workspace">
        {workspaces.length > 0 && (
          <NewProjectButton
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
          />
        )}
      </Header>

      {workspaces.length === 0 ? (
        <Placeholder
          icon={FolderKanban}
          title="Noch kein Workspace"
          description="Erstelle zuerst einen Workspace, um Projekte anlegen zu können."
        >
          <CreateWorkspaceButton label="Workspace erstellen" />
        </Placeholder>
      ) : list.length === 0 ? (
        <Placeholder
          icon={FolderKanban}
          title="Noch keine Projekte"
          description='Lege über „Neues Projekt" dein erstes Projekt in diesem Workspace an.'
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
