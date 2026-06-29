"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProjectAccess, requireTaskAccess, requireUser } from "@/lib/authz";

// Laufenden Timer (ohne stopped_at) finalisieren.
async function stopRunning(supabase, userId) {
  const { data: running } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .is("stopped_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (running) {
    const seconds = Math.max(
      0,
      Math.round((Date.now() - new Date(running.started_at).getTime()) / 1000)
    );
    await supabase
      .from("time_entries")
      .update({ stopped_at: new Date().toISOString(), duration_seconds: seconds })
      .eq("id", running.id);
  }
}

async function validateTaskProject(supabase, taskId, projectId) {
  if (!taskId) return null;

  const taskAccess = await requireTaskAccess(supabase, taskId);
  if (taskAccess.error) return taskAccess;
  if (taskAccess.task.project_id !== projectId) {
    return { error: "Aufgabe gehört nicht zu diesem Projekt." };
  }

  return null;
}

// Timer für eine Aufgabe/ein Projekt starten (stoppt einen evtl. laufenden zuerst).
export async function startTimer({ taskId, projectId, billable = true }) {
  const supabase = await createClient();
  if (!projectId) return { error: "Bitte ein Projekt wählen." };

  const access = await requireProjectAccess(supabase, projectId);
  if (access.error) return { error: access.error };

  const taskError = await validateTaskProject(supabase, taskId, projectId);
  if (taskError?.error) return { error: taskError.error };

  await stopRunning(supabase, access.user.id);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      task_id: taskId || null,
      project_id: projectId,
      user_id: access.user.id,
      started_at: new Date().toISOString(),
      billable,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/time-tracking");
  return { data };
}

export async function stopTimer() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  await stopRunning(supabase, auth.user.id);
  revalidatePath("/time-tracking");
  return { ok: true };
}

// Manuellen Zeiteintrag hinzufügen.
export async function addManualEntry({
  taskId,
  projectId,
  date,
  hours,
  minutes,
  description,
  billable = true,
}) {
  const supabase = await createClient();
  if (!projectId) return { error: "Bitte ein Projekt wählen." };

  const access = await requireProjectAccess(supabase, projectId);
  if (access.error) return { error: access.error };

  const taskError = await validateTaskProject(supabase, taskId, projectId);
  if (taskError?.error) return { error: taskError.error };

  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;
  if (seconds <= 0) return { error: "Bitte eine Dauer angeben." };

  const start = date ? new Date(`${date}T09:00:00`) : new Date();
  const end = new Date(start.getTime() + seconds * 1000);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      task_id: taskId || null,
      project_id: projectId,
      user_id: access.user.id,
      started_at: start.toISOString(),
      stopped_at: end.toISOString(),
      duration_seconds: seconds,
      description: description?.trim() || null,
      billable,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath("/time-tracking");
  return { data };
}
