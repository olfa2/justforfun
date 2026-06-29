"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/authz";

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", auth.user.id)
    .eq("read", false);
  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { ok: true };
}

export async function markNotificationRead(id) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", auth.user.id);
  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { ok: true };
}
