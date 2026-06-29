// KPI-Karte: Mono-Label (uppercase), großer Mono-Wert, optionales Trend-Delta.
export function KpiCard({ label, value, suffix, delta }) {
  return (
    <div className="rounded-xl border border-border bg-card px-[18px] py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-[30px] font-semibold leading-[0.9] tracking-[-0.02em]">
          {value}
          {suffix}
        </span>
        {delta ? (
          <span className="font-mono text-xs text-positive">{delta}</span>
        ) : null}
      </div>
    </div>
  );
}
