"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { deleteEvent } from "@/app/actions/events";

// Detail-Dialog für ein Kalender-Item (Termin oder Task-Deadline).
// Wird von Monats- UND Wochenansicht genutzt.
export function EventDetailModal({ item, open, onClose }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!item) return null;

  const d = new Date(item.date);
  const isTask = item.kind === "task";
  const timeless = isTask || item.allDay;
  const when = timeless
    ? format(d, "EEEE, d. MMMM yyyy", { locale: de })
    : format(d, "EEEE, d. MMMM yyyy · HH:mm", { locale: de });

  async function handleDelete() {
    setDeleting(true);
    await deleteEvent(item.rawId);
    setDeleting(false);
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title={isTask ? "Deadline" : "Termin"}>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{when}</p>
          </div>
        </div>

        {item.projectName && (
          <p className="text-sm">
            <span className="text-muted-foreground">Projekt: </span>
            {item.projectName}
          </p>
        )}
        {item.description && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          {isTask ? (
            item.projectId ? (
              <Link
                href={`/projects/${item.projectId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Zur Aufgabe
              </Link>
            ) : (
              <span />
            )
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Löschen
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
    </Modal>
  );
}
