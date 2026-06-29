import Link from "next/link";

// „Projektfortschritt" – Balken je Projekt (erledigt/gesamt) in Projektfarbe.
export function ProjectProgressCard({ progress }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">Projektfortschritt</h3>
        <Link
          href="/projects"
          className="text-xs font-medium text-nav-active hover:underline"
        >
          Alle anzeigen
        </Link>
      </div>

      {progress.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">Noch keine Projekte.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {progress.map((p) => (
            <li key={p.id} className="flex items-center gap-4">
              <Link
                href={`/projects/${p.id}`}
                className="w-[180px] shrink-0 truncate text-[13.5px] hover:text-accent"
              >
                {p.name}
              </Link>
              <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${p.pct}%`,
                    backgroundColor: p.color || "var(--accent)",
                  }}
                />
              </div>
              <span className="w-[42px] shrink-0 text-right font-mono text-[12.5px] text-muted-foreground">
                {p.pct}%
              </span>
              <span className="hidden w-[68px] shrink-0 text-right font-mono text-[11px] text-muted-foreground sm:block">
                {p.done}/{p.total}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
