"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notify";

// Workspace-ID zu einem Projekt holen (für Benachrichtigungs-Scoping/RLS).
async function projectWorkspaceId(supabase, projectId) {
  const { data } = await supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .maybeSingle();
  return data?.workspace_id ?? null;
}

// Neue Aufgabe anlegen – sort_order ans Ende der Zielspalte.
export async function createTask(input) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const title = (input?.title || "").trim();
  if (!title) return { error: "Bitte einen Titel eingeben." };
  if (!input?.projectId) return { error: "Projekt fehlt." };

  const status = input.status || "backlog";

  const { data: last } = await supabase
    .from("tasks")
    .select("sort_order")
    .eq("project_id", input.projectId)
    .eq("status", status)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (last?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: input.projectId,
      title,
      description: input.description?.trim() || null,
      status,
      priority: input.priority || "medium",
      assignee_id: input.assignee_id || null,
      due_date: input.due_date || null,
      sort_order: sortOrder,
      created_by: user.id,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  // Benachrichtigung an den Zugewiesenen
  if (data.assignee_id) {
    await createNotification(supabase, {
      user_id: data.assignee_id,
      actor_id: user.id,
      workspace_id: await projectWorkspaceId(supabase, input.projectId),
      project_id: input.projectId,
      task_id: data.id,
      type: "assignment",
      title: data.title,
    });
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}

// Bestehende Aufgabe bearbeiten (nur übergebene Felder).
export async function updateTask(taskId, patch) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Vorzustand für Änderungserkennung (Zuweisung/Status -> Benachrichtigung)
  const { data: before } = await supabase
    .from("tasks")
    .select("assignee_id, status, project_id, title")
    .eq("id", taskId)
    .maybeSingle();

  const update = {};
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.description !== undefined)
    update.description = patch.description?.trim() || null;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.priority !== undefined) update.priority = patch.priority;
  if (patch.assignee_id !== undefined)
    update.assignee_id = patch.assignee_id || null;
  if (patch.due_date !== undefined) update.due_date = patch.due_date || null;

  const { data, error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", taskId)
    .select()
    .single();
  if (error) return { error: error.message };

  // Benachrichtigungen
  if (before && user) {
    const assigneeChanged =
      update.assignee_id && update.assignee_id !== before.assignee_id;
    const statusChanged =
      update.status && update.status !== before.status;

    if (assigneeChanged || (statusChanged && data.assignee_id)) {
      const wsId = await projectWorkspaceId(supabase, before.project_id);
      if (assigneeChanged) {
        await createNotification(supabase, {
          user_id: update.assignee_id,
          actor_id: user.id,
          workspace_id: wsId,
          project_id: before.project_id,
          task_id: taskId,
          type: "assignment",
          title: data.title,
        });
      }
      if (statusChanged && data.assignee_id) {
        await createNotification(supabase, {
          user_id: data.assignee_id,
          actor_id: user.id,
          workspace_id: wsId,
          project_id: before.project_id,
          task_id: taskId,
          type: "status_change",
          title: data.title,
          status: update.status,
        });
      }
    }
  }

  if (patch.projectId) revalidatePath(`/projects/${patch.projectId}`);
  return { data };
}

// Aufgabe löschen.
export async function deleteTask(taskId, projectId) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { error: error.message };
  if (projectId) revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

// Drag & Drop: Status setzen und sort_order der Zielspalte neu vergeben.
export async function moveTask({ taskId, newStatus, orderedIds }) {
  const supabase = await createClient();

  const { error: statusError } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);
  if (statusError) return { error: statusError.message };

  if (Array.isArray(orderedIds) && orderedIds.length) {
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("tasks").update({ sort_order: index }).eq("id", id)
      )
    );
  }

  return { ok: true };
}
