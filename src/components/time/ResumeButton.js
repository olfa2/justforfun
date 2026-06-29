"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2 } from "lucide-react";
import { startTimer } from "@/app/actions/timeEntries";

// Startet einen neuen Timer für die Aufgabe eines vergangenen Eintrags.
export function ResumeButton({ taskId, projectId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    await startTimer({ taskId, projectId });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={go}
      disabled={busy}
      title="Timer für diese Aufgabe starten"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-popover text-muted-foreground transition-colors hover:text-foreground"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Play className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
