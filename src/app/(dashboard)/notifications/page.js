import { createClient } from "@/lib/supabase/server";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tabelle existiert evtl. noch nicht -> Fehler wird ignoriert, dann leer.
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const list = notifications || [];

  // Projektnamen/-farben für die Chips nachladen
  const projectIds = [...new Set(list.map((n) => n.project_id).filter(Boolean))];
  let projectMap = new Map();
  if (projectIds.length) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, color")
      .in("id", projectIds);
    projectMap = new Map((projects || []).map((p) => [p.id, p]));
  }

  const enriched = list.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    status: n.status,
    read: n.read,
    created_at: n.created_at,
    projectName: projectMap.get(n.project_id)?.name || "",
    projectColor: projectMap.get(n.project_id)?.color || "var(--muted-foreground)",
  }));

  return <NotificationsClient notifications={enriched} />;
}
