"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { CreateWorkspaceButton } from "@/components/workspace/CreateWorkspaceButton";
import { createProject } from "@/app/actions/projects";

export function NewProjectButton({ workspaces = [], activeWorkspaceId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Ohne Workspace kann kein Projekt angelegt werden -> erst Workspace erstellen.
  if (!workspaces.length) {
    return <CreateWorkspaceButton label="Workspace erstellen" />;
  }

  async function handleSubmit(values) {
    const res = await createProject(values);
    if (res?.error) return res;
    router.push(`/projects/${res.data.id}`);
    return { data: res.data };
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Neues Projekt
      </Button>
      <ProjectModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        workspaces={workspaces}
        defaultWorkspaceId={activeWorkspaceId}
      />
    </>
  );
}
