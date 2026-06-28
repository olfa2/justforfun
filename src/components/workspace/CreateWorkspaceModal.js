"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createWorkspace } from "@/app/actions/workspaces";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export function CreateWorkspaceModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await createWorkspace(name);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    setName("");
    onClose?.();
    onCreated?.(res.data);
  }

  return (
    <Modal open={open} onClose={onClose} title="Neuen Workspace erstellen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="ws-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Mein Team"
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

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Erstellen
          </Button>
        </div>
      </form>
    </Modal>
  );
}
