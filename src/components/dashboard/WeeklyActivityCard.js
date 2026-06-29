const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// Area-Chart „Wochenaktivität" – erledigte Aufgaben/Tag (letzte 7 Tage) als SVG.
export function WeeklyActivityCard({ weekly }) {
  const W = 320;
  const H = 96;
  const padX = 6;
  const padY = 12;
  const n = weekly.length;
  const max = Math.max(1, ...weekly.map((d) => d.count));
  const stepX = n > 1 ? (W - padX * 2) / (n - 1) : 0;

  const points = weekly.map((d, i) => {
    const x = padX + i * stepX;
    const y = H - padY - (d.count / max) * (H - padY * 2);
    return { x, y };
  });

  const line = points
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${points[n - 1].x.toFixed(1)},${H} L${points[0].x.toFixed(1)},${H} Z`;
  const totalWeek = weekly.reduce((a, d) => a + d.count, 0);

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-semibold">Wochenaktivität</h3>
        <span className="font-mono text-[11px] text-muted-foreground">
          {totalWeek} erledigt
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">letzte 7 Tage</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-3 h-24 w-full"
      >
        <defs>
          <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#weeklyFill)" />
        <path
          d={line}
          fill="none"
          stroke="oklch(0.72 0.16 280)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.6"
            fill="var(--card)"
            stroke="var(--accent)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="mt-1.5 flex justify-between px-1">
        {weekly.map((d, i) => (
          <span key={i} className="font-mono text-[10px] text-muted-foreground">
            {WD[new Date(d.date).getDay()]}
          </span>
        ))}
      </div>
    </div>
  );
}
