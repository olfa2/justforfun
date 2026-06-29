import "server-only";

const ACCESS_ERROR = "Kein Zugriff auf diese Ressource.";

export async function requireUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { error: "Nicht angemeldet." };
  return { user };
}

export async function requireWorkspaceMember(supabase, workspaceId) {
  if (!workspaceId) return { error: "Workspace fehlt." };

  const auth = await requireUser(supabase);
  if (auth.error) return auth;

  const { data, error } = await supabase
    .from("workspaces")
    .select("id, owner_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: ACCESS_ERROR };

  return { user: auth.user, workspace: data };
}

export async function requireWorkspaceOwner(supabase, workspaceId) {
  const access = await requireWorkspaceMember(supabase, workspaceId);
  if (access.error) return access;

  if (access.workspace.owner_id !== access.user.id) {
    return { error: "Nur Owner dürfen diesen Workspace ändern." };
  }

  return access;
}

export async function requireProjectAccess(supabase, projectId) {
  if (!projectId) return { error: "Projekt fehlt." };

  const auth = await requireUser(supabase);
  if (auth.error) return auth;

  const { data, error } = await supabase
    .from("projects")
    .select("id, workspace_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: ACCESS_ERROR };

  return { user: auth.user, project: data };
}

export async function requireTaskAccess(supabase, taskId) {
  if (!taskId) return { error: "Aufgabe fehlt." };

  const auth = await requireUser(supabase);
  if (auth.error) return auth;

  const { data, error } = await supabase
    .from("tasks")
    .select("id, project_id, assignee_id, status, title")
    .eq("id", taskId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: ACCESS_ERROR };

  return { user: auth.user, task: data };
}

export async function requireEventAccess(supabase, eventId) {
  if (!eventId) return { error: "Termin fehlt." };

  const auth = await requireUser(supabase);
  if (auth.error) return auth;

  const { data, error } = await supabase
    .from("events")
    .select("id, workspace_id, project_id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: ACCESS_ERROR };

  return { user: auth.user, event: data };
}
