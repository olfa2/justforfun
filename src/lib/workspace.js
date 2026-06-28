import { cookies } from "next/headers";

// Alle Workspaces, in denen der aktuelle User Mitglied ist (inkl. seiner Rolle).
export async function getWorkspaces(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workspace_members")
    .select("role, workspaces(*)")
    .eq("user_id", user.id);

  return (data || [])
    .map((m) => (m.workspaces ? { ...m.workspaces, role: m.role } : null))
    .filter(Boolean)
    .sort(
      (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
    );
}

// Aktiver Workspace aus Cookie – fällt auf den ersten Workspace zurück.
export async function getActiveWorkspaceId(workspaces) {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("ws")?.value;
  if (fromCookie && workspaces.some((w) => w.id === fromCookie)) {
    return fromCookie;
  }
  return workspaces[0]?.id ?? null;
}
