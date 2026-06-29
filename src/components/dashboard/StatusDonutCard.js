import { STATUS_META } from "@/lib/atlas";

// Donut „Aufgaben nach Status" – gestapelte SVG-Kreissegmente + Legende.
export function StatusDonutCard({ statusCounts, total, completionRate }) {
  const r = 54;
  const C = 2 * Math.PI * r;

  let acc = 0;
  const segments = statusCounts
    .filter((s) => s.count > 0)
    .map((s) => {
      const len = total ? (s.count / total) * C : 0;
      const seg = { ...s, len, offset: acc };
      acc += len;
      return seg;
    });

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
      <h3 className="text-[13px] font-semibold">Aufgaben nach Status</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {total} Aufgaben gesamt
      </p>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-[124px] w-[124px] shrink-0">
          <svg width="124" height="124" viewBox="0 0 124 124">
            <g transform="rotate(-90 62 62)">
              <circle
                cx="62"
                cy="62"
                r={r}
                fill="none"
                stroke="var(--secondary)"
                strokeWidth="14"
              />
              {segments.map((seg) => (
                <circle
                  key={seg.status}
                  cx="62"
                  cy="62"
                  r={r}
                  fill="none"
                  stroke={STATUS_META[seg.status]?.color}
                  strokeWidth="14"
                  strokeDasharray={`${seg.len} ${C - seg.len}`}
                  strokeDashoffset={-seg.offset}
                />
              ))}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[23px] font-semibold leading-none">
              {completionRate}%
            </span>
            <span className="mt-1 text-[10px] text-muted-foreground">erledigt</span>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5">
          {statusCounts.map((s) => (
            <li key={s.status} className="flex items-center gap-2 text-xs">
              <span
                className="h-[9px] w-[9px] rounded-[3px]"
                style={{ backgroundColor: STATUS_META[s.status]?.color }}
              />
              <span className="flex-1 text-muted-foreground">
                {STATUS_META[s.status]?.label}
              </span>
              <span className="font-mono text-foreground">{s.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
