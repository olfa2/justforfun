import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { getWorkspaces, getActiveWorkspaceId } from "@/lib/workspace";

export default async function DashboardLayout({ children }) {
  let supabase;
  let user = null;

  // Falls Supabase noch nicht konfiguriert ist, fällt der Client-Aufbau aus
  // -> sauber zum Login leiten statt mit einem 500er abzustürzen.
  try {
    supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    redirect("/login");
  }

  if (!user) redirect("/login");

  const workspaces = await getWorkspaces(supabase);
  const activeWorkspaceId = await getActiveWorkspaceId(workspaces);

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Nutzer";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={{ name, email: user.email }}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
      />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
