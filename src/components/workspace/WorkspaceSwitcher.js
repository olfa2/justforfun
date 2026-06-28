"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Settings2 } from "lucide-react";
import { setActiveWorkspace } from "@/app/actions/workspaces";
import { CreateWorkspaceModal } from "@/components/workspace/CreateWorkspaceModal";
import { WorkspaceSettingsModal } from "@/components/workspace/WorkspaceSettingsModal";
import { getInitials, stringToColor } from "@/lib/utils";

// Workspace-Auswahl in der Sidebar: zeigt den aktiven Workspace, lässt wechseln
// und neue erstellen. Passt sich der eingeklappten/aufgeklappten Rail an.
export function WorkspaceSwitcher({ workspaces = [], activeWorkspaceId }) {
  const router = useRouter();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const active =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function switchTo(id) {
    setOpen(false);
    if (id === active?.id) return;
    await setActiveWorkspace(id);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative border-b border-border px-2 py-2">
      <button
        onClick={() => setOpen((o) => !o)}
        title={active?.name || "Workspace"}
        className="flex h-10 w-full items-center rounded-md transition-colors hover:bg-card-hover"
      >
        <span className="flex w-12 shrink-0 items-center justify-center">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold text-white"
            style={{ backgroundColor: stringToColor(active?.name || "W") }}
          >
            {active ? getInitials(active.name) : "+"}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-between pr-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="truncate text-sm font-medium">
            {active?.name || "Kein Workspace"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </span>
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full z-30 mt-1 overflow-hidden rounded-md border border-border bg-card shadow-xl">
          <div className="max-h-60 overflow-y-auto py-1">
            {workspaces.length === 0 && (
              <p className="px-2.5 py-2 text-xs text-muted-foreground">
                Noch kein Workspace
              </p>
            )}
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => switchTo(w.id)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-sm transition-colors hover:bg-card-hover"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                  style={{ backgroundColor: stringToColor(w.name) }}
                >
                  {getInitials(w.name)}
                </span>
                <span className="flex-1 truncate text-left">{w.name}</span>
                {w.id === active?.id && (
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-border">
            {active && (
              <button
                onClick={() => {
                  setOpen(false);
                  setSettingsOpen(true);
                }}
                className="flex w-full items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
              >
                <Settings2 className="h-4 w-4" />
                Workspace verwalten
              </button>
            )}
            <button
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Neuer Workspace
            </button>
          </div>
        </div>
      )}

      <CreateWorkspaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => router.refresh()}
      />

      <WorkspaceSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        workspace={active}
        onSaved={() => router.refresh()}
        onDeleted={() => router.refresh()}
      />
    </div>
  );
}
