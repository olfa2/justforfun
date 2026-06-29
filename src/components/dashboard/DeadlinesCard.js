import { PRIO_META } from "@/lib/atlas";

const MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function formatDue(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / 86400000);
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Morgen";
  return `${d.getDate()}. ${MON[d.getMonth()]}`;
}

// Liste „Anstehende Deadlines" – Farbstrich nach Priorität, Datum in Mono.
export function DeadlinesCard({ deadlines }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
      <h3 className="text-[13px] font-semibold">Anstehende Deadlines</h3>

      {deadlines.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Keine anstehenden Deadlines.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {deadlines.map((d) => {
            const prio = PRIO_META[d.priority] || PRIO_META.medium;
            const label = formatDue(d.due_date);
            const isToday = label === "Heute";
            return (
              <li key={d.id} className="flex items-center gap-3">
                <span
                  className="h-[30px] w-[3px] shrink-0 rounded-full"
                  style={{ backgroundColor: prio.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground">{d.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {d.project}
                  </p>
                </div>
                <span
                  className="shrink-0 font-mono text-[11px] text-muted-foreground"
                  style={isToday ? { color: "var(--prio-urgent)" } : undefined}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
