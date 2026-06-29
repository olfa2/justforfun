import "server-only";

const ACCESS_ERROR = "Kein Zugriff auf diese Ressource.";
const ROLE_ERROR = "Keine Berechtigung für diese Aktion.";

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

  // Echte Membership-Prüfung (zweite Verteidigungslinie neben RLS).
  const { data: isMember } = await supabase.rpc("is_workspace_member", {
    ws_id: workspaceId,
  });
  if (!isMember) return { error: ACCESS_ERROR };

  return { user: auth.user, workspace: data };
}

// Owner ODER Admin dürfen Owner-nahe Aktionen ausführen (Rename etc.).
export async function requireWorkspaceOwner(supabase, workspaceId) {
  const access = await requireWorkspaceMember(supabase, workspaceId);
  if (access.error) return access;

  const { data: allowed } = await supabase.rpc("has_workspace_role", {
    ws_id: workspaceId,
    allowed_roles: ["owner", "admin"],
  });
  if (!allowed) {
    return { error: "Nur Owner oder Admins dürfen diesen Workspace ändern." };
  }

  return access;
}

// Strikte Variante: NUR der Owner. Für Aktionen, die wirklich owner-only sein
// müssen (z. B. Workspace löschen). Bewusst getrennt von requireWorkspaceOwner,
// damit Admins dort nicht durchrutschen.
export async function requireWorkspaceOwnerStrict(supabase, workspaceId) {
  const access = await requireWorkspaceMember(supabase, workspaceId);
  if (access.error) return access;

  if (access.workspace.owner_id !== access.user.id) {
    return { error: "Nur der Owner darf diese Aktion ausführen." };
  }

  return access;
}

export async function requireProjectAccess(supabase, projectId, options = {}) {
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

  const { data: isMember } = await supabase.rpc("is_project_member", {
    project_id_input: projectId,
  });
  if (!isMember) return { error: ACCESS_ERROR };

  if (options.roles) {
    const { data: hasRole } = await supabase.rpc("has_project_role", {
      project_id_input: projectId,
      allowed_roles: options.roles,
    });
    if (!hasRole) return { error: ROLE_ERROR };
  }

  return { user: auth.user, project: data };
}

export async function requireTaskAccess(supabase, taskId, options = {}) {
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

  const { data: isMember } = await supabase.rpc("is_project_member", {
    project_id_input: data.project_id,
  });
  if (!isMember) return { error: ACCESS_ERROR };

  if (options.roles) {
    const { data: hasRole } = await supabase.rpc("has_project_role", {
      project_id_input: data.project_id,
      allowed_roles: options.roles,
    });
    if (!hasRole) return { error: ROLE_ERROR };
  }

  return { user: auth.user, task: data };
}

export async function requireEventAccess(supabase, eventId, options = {}) {
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

  const { data: isMember } = await supabase.rpc("is_workspace_member", {
    ws_id: data.workspace_id,
  });
  if (!isMember) return { error: ACCESS_ERROR };

  if (options.roles) {
    const { data: hasRole } = await supabase.rpc("has_workspace_role", {
      ws_id: data.workspace_id,
      allowed_roles: options.roles,
    });
    if (!hasRole) return { error: ROLE_ERROR };
  }

  return { user: auth.user, event: data };
}
