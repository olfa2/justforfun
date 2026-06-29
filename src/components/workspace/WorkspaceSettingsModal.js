"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  updateWorkspace,
  deleteWorkspace,
  getCurrentMemberRole,
  getWorkspaceMembers,
} from "@/app/actions/workspaces";
import { useUser } from "@/hooks/useUser";
import { WORKSPACE_ROLES, getMeta } from "@/lib/constants";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

// Rolle -> vorhandene Badge-Variante (keine neuen Farben).
const ROLE_BADGE = {
  owner: "purple",
  admin: "blue",
  member: "default",
  viewer: "gray",
};

// Workspace umbenennen/löschen + Mitglieder anzeigen.
export function WorkspaceSettingsModal(props) {
  if (!props.open) return null;

  return <WorkspaceSettingsModalContent key={props.workspace?.id} {...props} />;
}

function WorkspaceSettingsModalContent({
  onClose,
  workspace,
  onSaved,
  onDeleted,
}) {
  const { user } = useUser();
  const [name, setName] = useState(workspace?.name || "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Rolle + Mitglieder laden (für Anzeige und Button-Gating)
  const [role, setRole] = useState(null);
  const [roleReady, setRoleReady] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const wsId = workspace?.id;
      if (!wsId) return;
      const [roleRes, membersRes] = await Promise.all([
        getCurrentMemberRole(wsId),
        getWorkspaceMembers(wsId),
      ]);
      if (ignore) return;
      setRole(roleRes?.role ?? null);
      setRoleReady(true);
      setMembers(membersRes?.members || []);
      setLoadingMembers(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [workspace?.id]);

  const canManage = role === "owner" || role === "admin"; // umbenennen
  const canDelete = role === "owner"; // löschen owner-only (wie Server)

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
    <Modal open onClose={onClose} title="Workspace verwalten">
      <div className="space-y-5">
        {/* Umbenennen (nur Owner/Admin) */}
        {roleReady && canManage && (
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
              <div>
                {canDelete && (
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
                )}
              </div>
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
        )}

        {/* Mitglieder */}
        <div
          className={
            roleReady && canManage
              ? "space-y-2 border-t border-border pt-4"
              : "space-y-2"
          }
        >
          <p className="text-sm font-medium">Mitglieder</p>

          {loadingMembers ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Mitglieder gefunden.
            </p>
          ) : (
            <ul className="space-y-2">
              {members.map((m) => {
                const isMe = user?.id && m.userId === user.id;
                const roleMeta = getMeta(WORKSPACE_ROLES, m.role);
                return (
                  <li
                    key={m.userId}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={m.name} size="sm" />
                      <span className="truncate text-sm font-medium">
                        {m.name}
                        {isMe && (
                          <span className="text-muted-foreground"> (Du)</span>
                        )}
                      </span>
                    </div>
                    <Badge variant={ROLE_BADGE[m.role] || "default"}>
                      {roleMeta.label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
