"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { updateProject, deleteProject } from "@/app/actions/projects";
import { getCurrentMemberRole } from "@/app/actions/workspaces";

// Öffnet das ProjectModal im Bearbeiten-Modus (Header der Detailseite).
export function EditProjectButton({ project }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Rolle laden, um das Lösch-Control nur für Owner/Admin zu zeigen.
  const [role, setRole] = useState(null);
  useEffect(() => {
    let ignore = false;
    getCurrentMemberRole(project.workspace_id).then((res) => {
      if (!ignore) setRole(res?.role ?? null);
    });
    return () => {
      ignore = true;
    };
  }, [project.workspace_id]);
  const canDelete = role === "owner" || role === "admin";

  async function handleSubmit(values) {
    const res = await updateProject(project.id, values);
    if (res?.error) return res;
    router.refresh();
    return { data: res.data };
  }

  async function handleDelete() {
    const res = await deleteProject(project.id);
    if (res?.error) return res;
    router.push("/projects");
    return { ok: true };
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Settings2 className="h-4 w-4" />
        Bearbeiten
      </Button>
      <ProjectModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        onDelete={canDelete ? handleDelete : undefined}
        initialProject={project}
      />
    </>
  );
}
