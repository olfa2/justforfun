import { cn } from "@/lib/utils";

const variants = {
  default: "bg-muted text-muted-foreground border-border",
  blue: "bg-accent/15 text-accent border-accent/25",
  green: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
  yellow: "bg-amber-500/15 text-amber-500 border-amber-500/25",
  red: "bg-red-500/15 text-red-500 border-red-500/25",
  purple: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  gray: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

export function Badge({ variant = "default", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
