import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PROJECT_STATUSES, getMeta } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export function ProjectCard({ project }) {
  const status = getMeta(PROJECT_STATUSES, project.status);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/40 hover:bg-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-sm font-medium group-hover:text-accent">
          {project.name || "Unbenanntes Projekt"}
        </h3>
        <Badge variant={status.badge}>{status.label}</Badge>
      </div>
      <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
        {project.description || "Keine Beschreibung"}
      </p>
      {project.created_at && (
        <div className="mt-3 text-xs text-muted-foreground">
          Erstellt am {formatDate(project.created_at)}
        </div>
      )}
    </Link>
  );
}
