import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LogoutButton } from "@/components/ui/LogoutButton";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Nutzer";

  return (
    <>
      <Header title="Einstellungen" description="Profil und App-Einstellungen" />

      <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
        {/* Profil */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Profil</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar name={name} size="xl" />
            <div className="min-w-0">
              <p className="truncate font-medium">{name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Name und Passwort ändern bauen wir im nächsten Schritt ein.
          </p>
        </section>

        {/* Darstellung */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Darstellung</h2>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Design</p>
              <p className="text-xs text-muted-foreground">
                Zwischen hellem und dunklem Modus wechseln.
              </p>
            </div>
            <ThemeToggle showLabel className="border border-border px-3" />
          </div>
        </section>

        {/* Konto */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Konto</h2>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Von diesem Gerät abmelden.
            </p>
            <LogoutButton />
          </div>
        </section>
      </div>
    </>
  );
}
