"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  UserPlus,
  Clock,
  AtSign,
  ArrowRightCircle,
} from "lucide-react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import { TASK_STATUSES, getMeta } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";

const TYPE_META = {
  assignment: {
    icon: UserPlus,
    color: "var(--accent)",
    tint: "color-mix(in oklab, var(--accent) 14%, transparent)",
  },
  status_change: {
    icon: ArrowRightCircle,
    color: "var(--status-in-progress)",
    tint: "color-mix(in oklab, var(--status-in-progress) 14%, transparent)",
  },
  deadline: {
    icon: Clock,
    color: "oklch(0.74 0.16 25)",
    tint: "oklch(0.65 0.20 25 / 0.14)",
  },
  mention: {
    icon: AtSign,
    color: "var(--accent)",
    tint: "color-mix(in oklab, var(--accent) 14%, transparent)",
  },
  info: { icon: Bell, color: "var(--muted-foreground)", tint: "var(--popover)" },
};

const FILTERS = [
  { id: "all", label: "Alle" },
  { id: "unread", label: "Ungelesen" },
  { id: "mentions", label: "Erwähnungen" },
];

function renderMessage(n) {
  const obj = <b className="font-medium text-foreground">„{n.title}"</b>;
  switch (n.type) {
    case "assignment":
      return <>Dir wurde {obj} zugewiesen</>;
    case "status_change":
      return (
        <>
          {obj} ist jetzt {getMeta(TASK_STATUSES, n.status).label}
        </>
      );
    case "deadline":
      return <>{obj} ist heute fällig</>;
    case "mention":
      return <>Du wurdest erwähnt: {obj}</>;
    default:
      return n.title;
  }
}

function groupLabel(dateStr) {
  const d = new Date(dateStr);
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startYest = new Date(startToday);
  startYest.setDate(startYest.getDate() - 1);
  const startWeek = new Date(startToday);
  startWeek.setDate(startWeek.getDate() - 7);
  if (d >= startToday) return "Heute";
  if (d >= startYest) return "Gestern";
  if (d >= startWeek) return "Diese Woche";
  return "Älter";
}

export function NotificationsClient({ notifications = [] }) {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState("all");

  const unread = items.filter((n) => !n.read).length;

  const filtered = items.filter((n) =>
    filter === "unread" ? !n.read : filter === "mentions" ? n.type === "mention" : true
  );

  // Nach Tag gruppieren (Items kommen bereits absteigend sortiert)
  const order = [];
  const grouped = new Map();
  for (const n of filtered) {
    const label = groupLabel(n.created_at);
    if (!grouped.has(label)) {
      grouped.set(label, []);
      order.push(label);
    }
    grouped.get(label).push(n);
  }

  async function handleClick(n) {
    if (n.read) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    await markNotificationRead(n.id);
  }

  async function handleAllRead() {
    if (unread === 0) return;
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    await markAllNotificationsRead();
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-7 py-[18px] backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[19px] font-semibold tracking-[-0.01em]">
              Benachrichtigungen
            </h1>
            {unread > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] font-medium text-accent-foreground">
                {unread}
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">
            Aktivitäten und Hinweise aus deinen Projekten
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-border bg-popover p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === f.id
                    ? "bg-accent/16 text-nav-active"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAllRead}
            disabled={unread === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-popover px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Alle als gelesen
          </button>
        </div>
      </header>

      <div className="flex justify-center px-7 py-6">
        <div className="w-full max-w-[840px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-popover text-muted-foreground">
                <Bell className="h-7 w-7" />
              </div>
              <h2 className="text-base font-semibold">Keine Benachrichtigungen</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Sobald du Aufgaben zuweist oder Status änderst, erscheinen hier
                Hinweise.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nichts in dieser Ansicht.
            </p>
          ) : (
            <div className="space-y-6">
              {order.map((label) => (
                <section key={label}>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    {label}
                  </p>
                  <div className="space-y-1">
                    {grouped.get(label).map((n) => (
                      <NotificationRow key={n.id} n={n} onClick={handleClick} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NotificationRow({ n, onClick }) {
  const meta = TYPE_META[n.type] || TYPE_META.info;
  const Icon = meta.icon;

  return (
    <button
      onClick={() => onClick(n)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-card-hover",
        !n.read && "bg-accent/[0.055]"
      )}
    >
      <span
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]"
        style={{ backgroundColor: meta.tint, color: meta.color }}
      >
        <Icon className="h-[17px] w-[17px]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          {renderMessage(n)}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {n.projectName && (
            <span className="inline-flex items-center gap-1 rounded-[5px] border border-border bg-popover px-1.5 py-0.5 text-[11px] text-muted-foreground">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ backgroundColor: n.projectColor }}
              />
              {n.projectName}
            </span>
          )}
          <span className="font-mono text-[11px] text-muted-foreground">
            {timeAgo(n.created_at)}
          </span>
        </div>
      </div>

      {!n.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
      )}
    </button>
  );
}
