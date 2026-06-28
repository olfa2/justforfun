"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { updateWorkspace, deleteWorkspace } from "@/app/actions/workspaces";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

// Workspace umbenennen oder löschen.
export function WorkspaceSettingsModal({
  open,
  onClose,
  workspace,
  onSaved,
  onDeleted,
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(workspace?.name || "");
    setError("");
  }, [open, workspace]);

  async function handleSave(e) {
    e.preventDefault();
    if (!workspace) return;
    setError("");
    setLoading(true);
    const res = await updateWorkspace(workspace.id, name);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    onClose?.();
    onSaved?.();
  }

  async function handleDelete() {
    if (!workspace) return;
    if (
      !window.confirm(
        `Workspace „${workspace.name}" wirklich löschen? Alle Projekte und Aufgaben darin gehen verloren.`
      )
    )
      return;
    setError("");
    setDeleting(true);
    const res = await deleteWorkspace(workspace.id);
    setDeleting(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    onClose?.();
    onDeleted?.();
  }

  return (
    <Modal open={open} onClose={onClose} title="Workspace verwalten">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workspace-Name"
            className={fieldClass}
            autoFocus
            required
          />
        </div>

        {error && (
          <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Löschen
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Abbrechen
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
