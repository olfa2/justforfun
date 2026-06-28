"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Clock,
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
  LayoutGrid,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { cn, getInitials, stringToColor } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projekte", icon: FolderKanban },
  { href: "/calendar", label: "Kalender", icon: Calendar },
  { href: "/time-tracking", label: "Zeiterfassung", icon: Clock },
  { href: "/notifications", label: "Benachrichtigungen", icon: Bell },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

// Gemeinsame Zeilen-Styles für Nav-Einträge, Theme-Schalter, User & Logout.
const rowBase =
  "relative mx-2 flex h-9 w-[calc(100%-1rem)] items-center rounded-md text-sm transition-colors";
const iconBox = "flex w-12 shrink-0 items-center justify-center";
const labelClass =
  "truncate pr-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100";

export function Sidebar({ user, workspaces = [], activeWorkspaceId }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = user?.name || user?.email || "Nutzer";

  return (
    <>
      {/* Platzhalter im Layout-Fluss: reserviert die Breite der Icon-Rail. */}
      <div className="w-16 shrink-0" aria-hidden />

      {/* Fixierte Rail – überlagert den Content beim Aufklappen (kein Reflow). */}
      <aside className="group fixed left-0 top-0 z-40 flex h-screen w-16 flex-col overflow-hidden border-r border-border bg-sidebar transition-[width] duration-200 ease-out hover:w-60 hover:shadow-2xl">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-border">
          <span className={iconBox}>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <LayoutGrid className="h-4 w-4" />
            </span>
          </span>
          <span className="truncate text-sm font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Dashboard
          </span>
        </div>

        {/* Workspace-Auswahl */}
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  rowBase,
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                )}
              >
                <span className={iconBox}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className={labelClass}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: Theme, User, Logout */}
        <div className="shrink-0 space-y-0.5 border-t border-border py-2">
          <ThemeRow />

          <div className={cn(rowBase, "cursor-default text-foreground")}>
            <span className={iconBox}>
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: stringToColor(displayName) }}
              >
                {getInitials(displayName)}
              </span>
            </span>
            <span className="flex min-w-0 flex-col leading-tight opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="truncate text-xs font-medium">{user?.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user?.email}
              </span>
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Abmelden"
            className={cn(
              rowBase,
              "text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            )}
          >
            <span className={iconBox}>
              <LogOut className="h-[18px] w-[18px]" />
            </span>
            <span className={labelClass}>Abmelden</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Dark/Light-Umschalter im Sidebar-Stil (mounted-Guard gegen Hydration-Mismatch).
function ThemeRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title="Theme wechseln"
      className={cn(
        rowBase,
        "text-muted-foreground hover:bg-card-hover hover:text-foreground"
      )}
    >
      <span className={iconBox}>
        {mounted && isDark ? (
          <Sun className="h-[18px] w-[18px]" />
        ) : (
          <Moon className="h-[18px] w-[18px]" />
        )}
      </span>
      <span className={labelClass}>
        {mounted && isDark ? "Heller Modus" : "Dunkler Modus"}
      </span>
    </button>
  );
}
