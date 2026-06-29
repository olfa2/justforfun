"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

// Timer für eine Aufgabe/ein Projekt starten (stoppt einen evtl. laufenden zuerst).
export async function startTimer({ taskId, projectId, billable = true }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };
  if (!projectId) return { error: "Bitte ein Projekt wählen." };

  await stopRunning(supabase, user.id);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      task_id: taskId || null,
      project_id: projectId,
      user_id: user.id,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  await stopRunning(supabase, user.id);
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };
  if (!projectId) return { error: "Bitte ein Projekt wählen." };

  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;
  if (seconds <= 0) return { error: "Bitte eine Dauer angeben." };

  const start = date ? new Date(`${date}T09:00:00`) : new Date();
  const end = new Date(start.getTime() + seconds * 1000);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      task_id: taskId || null,
      project_id: projectId,
      user_id: user.id,
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
