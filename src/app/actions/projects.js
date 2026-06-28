"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Neues Projekt in einem Workspace anlegen.
export async function createProject(input) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const name = (input?.name || "").trim();
  if (!name) return { error: "Bitte einen Projektnamen eingeben." };
  if (!input?.workspaceId) return { error: "Bitte einen Workspace wählen." };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: input.workspaceId,
      name,
      description: input.description?.trim() || null,
      status: input.status || "active",
      color: input.color || null,
      start_date: input.start_date || null,
      due_date: input.due_date || null,
      created_by: user.id,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { data };
}

// Projekt bearbeiten (nur übergebene Felder).
export async function updateProject(projectId, patch) {
  const supabase = await createClient();

  const update = {};
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.description !== undefined)
    update.description = patch.description?.trim() || null;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.color !== undefined) update.color = patch.color || null;
  if (patch.start_date !== undefined)
    update.start_date = patch.start_date || null;
  if (patch.due_date !== undefined) update.due_date = patch.due_date || null;

  if (update.name === "") return { error: "Bitte einen Projektnamen eingeben." };

  const { data, error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", projectId)
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  return { data };
}

// Projekt löschen.
export async function deleteProject(projectId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);
  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { ok: true };
}
