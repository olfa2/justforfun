"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireUser,
  requireWorkspaceMember,
  requireWorkspaceOwner,
  requireWorkspaceOwnerStrict,
} from "@/lib/authz";
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
// Bewusst owner-only (strikt), Admins dürfen NICHT löschen.
export async function deleteWorkspace(workspaceId) {
  const supabase = await createClient();
  const access = await requireWorkspaceOwnerStrict(supabase, workspaceId);
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

// Rolle des eingeloggten Users im Workspace (für UI-Gating).
export async function getCurrentMemberRole(workspaceId) {
  if (!workspaceId) return { role: null };
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { role: null };

  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return { role: data?.role ?? null };
}

// Alle Mitglieder eines Workspaces inkl. Profil-Infos.
// Zwei-Query-Variante (members + profiles separat): workspace_members.user_id
// zeigt auf auth.users, daher kein direkter PostgREST-Embed zu profiles.
export async function getWorkspaceMembers(workspaceId) {
  if (!workspaceId) return { members: [] };
  const supabase = await createClient();
  const access = await requireWorkspaceMember(supabase, workspaceId);
  if (access.error) return { error: access.error, members: [] };

  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (error) return { error: error.message, members: [] };

  const rows = data || [];
  const userIds = rows.map((m) => m.user_id);

  // Profile separat laden und mergen (best effort – fehlt die Tabelle,
  // bleibt der Name "Unbekannt", Rollen bleiben korrekt).
  let profileMap = new Map();
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);
    profileMap = new Map((profiles || []).map((p) => [p.id, p]));
  }

  const members = rows.map((m) => {
    const p = profileMap.get(m.user_id);
    return {
      userId: m.user_id,
      role: m.role,
      name: p?.full_name || "Unbekannt",
      avatarUrl: p?.avatar_url || null,
    };
  });

  return { members };
}
