"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireWorkspaceMember, requireWorkspaceOwner } from "@/lib/authz";
import { slugify } from "@/lib/utils";

// Workspace anlegen + den Ersteller manuell als owner in workspace_members
// eintragen (es gibt keinen DB-Trigger dafür).
export async function createWorkspace(name) {
  const cleanName = (name || "").trim();
  if (!cleanName) return { error: "Bitte einen Namen eingeben." };

  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  const slug = `${slugify(cleanName)}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ name: cleanName, slug, owner_id: auth.user.id })
    .select()
    .single();
  if (error) return { error: error.message };

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspace.id, user_id: auth.user.id, role: "owner" });
  if (memberError) {
    return {
      error: `Workspace erstellt, aber Owner-Eintrag fehlgeschlagen: ${memberError.message}`,
    };
  }

  // Neuen Workspace direkt aktiv setzen.
  const cookieStore = await cookies();
  cookieStore.set("ws", workspace.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  return { data: workspace };
}

// Aktiven Workspace (per Cookie) wechseln.
export async function setActiveWorkspace(workspaceId) {
  if (!workspaceId) return { error: "Kein Workspace angegeben." };

  const supabase = await createClient();
  const access = await requireWorkspaceMember(supabase, workspaceId);
  if (access.error) return { error: access.error };

  const cookieStore = await cookies();
  cookieStore.set("ws", workspaceId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

// Workspace umbenennen.
export async function updateWorkspace(workspaceId, name) {
  const clean = (name || "").trim();
  if (!clean) return { error: "Bitte einen Namen eingeben." };

  const supabase = await createClient();
  const access = await requireWorkspaceOwner(supabase, workspaceId);
  if (access.error) return { error: access.error };

  const { data, error } = await supabase
    .from("workspaces")
    .update({ name: clean })
    .eq("id", workspaceId)
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { data };
}

// Workspace löschen (inkl. zugehöriger Daten, sofern DB-Cascade gesetzt ist).
export async function deleteWorkspace(workspaceId) {
  const supabase = await createClient();
  const access = await requireWorkspaceOwner(supabase, workspaceId);
  if (access.error) return { error: access.error };

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);
  if (error) return { error: error.message };

  const cookieStore = await cookies();
  if (cookieStore.get("ws")?.value === workspaceId) {
    cookieStore.delete("ws");
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
