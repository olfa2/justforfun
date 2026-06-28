"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

// Umschalter zwischen Dark- und Light-Mode.
// `mounted`-Guard verhindert Hydration-Mismatch (Theme ist erst client-seitig bekannt).
export function ThemeToggle({ className, showLabel = false }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center gap-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground",
        className
      )}
      aria-label="Theme wechseln"
      title="Theme wechseln"
    >
      {mounted && isDark ? (
        <Sun className="h-4 w-4 shrink-0" />
      ) : (
        <Moon className="h-4 w-4 shrink-0" />
      )}
      {showLabel && (
        <span className="text-sm">
          {mounted && isDark ? "Heller Modus" : "Dunkler Modus"}
        </span>
      )}
    </button>
  );
}
