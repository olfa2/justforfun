"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreateWorkspaceModal } from "@/components/workspace/CreateWorkspaceModal";

// Button + Modal zum Anlegen eines Workspaces. Nach Erfolg: Daten neu laden.
export function CreateWorkspaceButton({
  label = "Workspace erstellen",
  variant = "primary",
  size = "sm",
  className,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <CreateWorkspaceModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
