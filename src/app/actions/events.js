"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireEventAccess,
  requireProjectAccess,
  requireWorkspaceMember,
} from "@/lib/authz";

// Neuen Termin/Event anlegen.
export async function createEvent({
  workspaceId,
  projectId,
  title,
  description,
  date,
  time,
  allDay,
}) {
  const supabase = await createClient();

  const t = (title || "").trim();
  if (!t) return { error: "Bitte einen Titel eingeben." };
  if (!workspaceId) return { error: "Workspace fehlt." };
  if (!date) return { error: "Bitte ein Datum wählen." };

  const workspaceAccess = await requireWorkspaceMember(supabase, workspaceId);
  if (workspaceAccess.error) return { error: workspaceAccess.error };

  if (projectId) {
    const projectAccess = await requireProjectAccess(supabase, projectId);
    if (projectAccess.error) return { error: projectAccess.error };
    if (projectAccess.project.workspace_id !== workspaceId) {
      return { error: "Projekt gehört nicht zu diesem Workspace." };
    }
  }

  const startIso = allDay
    ? new Date(`${date}T00:00:00`).toISOString()
    : new Date(`${date}T${time || "09:00"}:00`).toISOString();

  const { data, error } = await supabase
    .from("events")
    .insert({
      workspace_id: workspaceId,
      project_id: projectId || null,
      title: t,
      description: description?.trim() || null,
      start_at: startIso,
      end_at: null,
      all_day: !!allDay,
      created_by: workspaceAccess.user.id,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/calendar");
  return { data };
}

export async function deleteEvent(eventId) {
  const supabase = await createClient();
  const access = await requireEventAccess(supabase, eventId);
  if (access.error) return { error: access.error };

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };

  revalidatePath("/calendar");
  return { ok: true };
}
