"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { de } from "date-fns/locale";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { EventModal } from "./EventModal";
import { EventDetailModal } from "./EventDetailModal";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const VIEWS = [
  { id: "month", label: "Monat" },
  { id: "week", label: "Woche" },
  { id: "list", label: "Liste" },
];

// Stunden-Raster der Wochenansicht: 07:00 – 22:00
const START_HOUR = 7;
const END_HOUR = 22;
const ROW_H = 48; // px pro Stunde

export function CalendarView({ items = [], projects = [], workspaceId }) {
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState("month");

  // „Neuer Termin"-Modal (mit vorbelegtem Datum/Uhrzeit)
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState(today);
  const [createTime, setCreateTime] = useState("09:00");

  // Detail-Dialog
  const [detailItem, setDetailItem] = useState(null);

  const norm = useMemo(
    () => items.map((it) => ({ ...it, d: new Date(it.date) })),
    [items]
  );

  const monthDays = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const weekStart = useMemo(
    () => startOfWeek(cursor, { weekStartsOn: 1 }),
    [cursor]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const itemsOn = (day) =>
    norm.filter((it) => isSameDay(it.d, day)).sort((a, b) => a.d - b.d);

  const agenda = itemsOn(selected);
  const upcoming = useMemo(
    () => norm.filter((it) => it.d >= today).sort((a, b) => a.d - b.d).slice(0, 30),
    [norm, today]
  );

  // ----- gemeinsame Aktionen (Monat + Woche) -----
  function openCreate(day, time) {
    setSelected(day);
    setCreateDate(day);
    setCreateTime(time || "09:00");
    setCreateOpen(true);
  }
  function openDetail(item) {
    setDetailItem(item);
  }

  function goPrev() {
    setCursor(view === "week" ? addDays(cursor, -7) : subMonths(cursor, 1));
  }
  function goNext() {
    setCursor(view === "week" ? addDays(cursor, 7) : addMonths(cursor, 1));
  }
  function goToday() {
    setCursor(today);
    setSelected(today);
  }

  const label =
    view === "week"
      ? `${format(weekStart, "d. MMM", { locale: de })} – ${format(
          addDays(weekStart, 6),
          "d. MMM yyyy",
          { locale: de }
        )}`
      : format(cursor, "MMMM yyyy", { locale: de });

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-7 py-[18px] backdrop-blur">
        <div>
          <h1 className="text-[19px] font-semibold tracking-[-0.01em]">Kalender</h1>
          <p className="text-[13px] text-muted-foreground">
            Termine, Deadlines &amp; Events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={goPrev}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-popover text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Zurück"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[150px] text-center text-[15px] font-semibold">
              {label}
            </span>
            <button
              onClick={goNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-popover text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Weiter"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={goToday}
            className="h-8 rounded-lg border border-border bg-popover px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Heute
          </button>

          <div className="inline-flex rounded-lg border border-border bg-popover p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  view === v.id
                    ? "bg-accent/16 text-nav-active"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => openCreate(selected)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Neuer Termin
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Hauptbereich */}
        <div className="min-w-0 flex-1 p-6">
          {view === "month" && (
            <MonthGrid
              days={monthDays}
              cursor={cursor}
              today={today}
              selected={selected}
              itemsOn={itemsOn}
              onDayClick={(day) => openCreate(day)}
              onEventClick={openDetail}
            />
          )}
          {view === "week" && (
            <WeekGrid
              days={weekDays}
              today={today}
              itemsOn={itemsOn}
              onSlotClick={openCreate}
              onEventClick={openDetail}
            />
          )}
          {view === "list" && (
            <ListView upcoming={upcoming} onEventClick={openDetail} />
          )}
        </div>

        {/* Rechtes Panel */}
        <aside className="w-full shrink-0 border-t border-border p-6 lg:w-80 lg:border-l lg:border-t-0">
          <h2 className="text-[15px] font-semibold">
            {format(selected, "EEEE, d. MMMM", { locale: de })}
          </h2>
          {isSameDay(selected, today) && (
            <span className="font-mono text-[11px] uppercase text-nav-active">
              Heute
            </span>
          )}

          <div className="mt-4 space-y-0">
            {agenda.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Einträge an diesem Tag.
              </p>
            ) : (
              agenda.map((it) => (
                <button
                  key={it.id}
                  onClick={() => openDetail(it)}
                  className="flex w-full items-start gap-3 border-b border-border py-2.5 text-left transition-colors hover:bg-card-hover"
                >
                  <span className="w-[42px] shrink-0 pt-0.5 font-mono text-[12px] text-muted-foreground">
                    {it.allDay || it.kind === "task" ? "—" : format(it.d, "HH:mm")}
                  </span>
                  <span
                    className="mt-1 h-[26px] w-[3px] shrink-0 rounded-full"
                    style={{ backgroundColor: it.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-foreground">{it.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {it.kind === "task" ? "Deadline" : "Termin"}
                      {it.projectName ? ` · ${it.projectName}` : ""}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {projects.length > 0 && (
            <div className="mt-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                Projekte
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {projects.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-[13px]">
                    <span
                      className="h-[10px] w-[10px] rounded-[3px]"
                      style={{ backgroundColor: p.color || "var(--muted-foreground)" }}
                    />
                    <span className="flex-1 truncate text-muted-foreground">
                      {p.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <EventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projects={projects}
        workspaceId={workspaceId}
        defaultDate={createDate}
        defaultTime={createTime}
      />
      <EventDetailModal
        item={detailItem}
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}

function MonthGrid({ days, cursor, today, selected, itemsOn, onDayClick, onEventClick }) {
  return (
    <div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="pb-2 text-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground"
          >
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-border">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selected);
          const dayItems = itemsOn(day);
          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={cn(
                "flex min-h-[104px] cursor-pointer flex-col gap-1 border-b border-r border-border p-2 transition-colors",
                !inMonth && "bg-popover/40",
                isSelected ? "bg-card-hover" : "hover:bg-card-hover/60"
              )}
            >
              <div className="flex justify-end">
                <span
                  className={cn(
                    "flex h-[22px] w-[22px] items-center justify-center rounded-full font-mono text-[12px]",
                    isToday
                      ? "bg-accent font-semibold text-accent-foreground"
                      : inMonth
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {dayItems.slice(0, 3).map((it) => (
                  <button
                    key={it.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(it);
                    }}
                    className="flex items-center gap-1.5 rounded-[5px] bg-popover px-1.5 py-[2px] transition-colors hover:brightness-125"
                  >
                    <span
                      className="h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ backgroundColor: it.color }}
                    />
                    <span className="truncate text-[11px] text-foreground/90">
                      {it.title}
                    </span>
                  </button>
                ))}
                {dayItems.length > 3 && (
                  <span className="pl-1 font-mono text-[10px] text-muted-foreground">
                    +{dayItems.length - 3} weitere
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({ days, today, itemsOn, onSlotClick, onEventClick }) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const gridTemplate = "56px repeat(7, minmax(0, 1fr))";

  // Position/Höhe eines getimten Events im Stundenraster
  function blockStyle(it) {
    const startH = it.d.getHours() + it.d.getMinutes() / 60;
    const end = it.end ? new Date(it.end) : null;
    const durH = end ? Math.max(0.5, (end - it.d) / 3600000) : 1;
    const top = Math.max(0, (startH - START_HOUR) * ROW_H);
    const maxH = (END_HOUR - START_HOUR) * ROW_H;
    const height = Math.min(maxH - top, Math.max(22, durH * ROW_H));
    return { top, height };
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Kopf mit Wochentagen */}
      <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
        <div className="border-b border-r border-border" />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className={cn(
                "border-b border-r border-border px-2 py-2 text-center",
                isToday && "bg-card-hover"
              )}
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                {WEEKDAYS[i]}
              </div>
              <div
                className={cn(
                  "mx-auto mt-1 flex h-[22px] w-[22px] items-center justify-center rounded-full font-mono text-[12px]",
                  isToday
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ganztägige Einträge / Deadlines */}
      <div
        className="grid border-b border-border"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div className="flex items-center justify-end border-r border-border px-1 py-1 font-mono text-[10px] text-muted-foreground">
          ganzt.
        </div>
        {days.map((day, i) => {
          const allDayItems = itemsOn(day).filter(
            (it) => it.allDay || it.kind === "task"
          );
          return (
            <div
              key={i}
              className={cn(
                "min-h-[30px] space-y-1 border-r border-border p-1",
                isSameDay(day, today) && "bg-card-hover/40"
              )}
            >
              {allDayItems.map((it) => (
                <button
                  key={it.id}
                  onClick={() => onEventClick(it)}
                  className="flex w-full items-center gap-1.5 rounded-[5px] bg-popover px-1.5 py-[2px] transition-colors hover:brightness-125"
                >
                  <span
                    className="h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ backgroundColor: it.color }}
                  />
                  <span className="truncate text-[11px] text-foreground/90">
                    {it.title}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Stundenraster */}
      <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
        {/* Zeit-Gutter */}
        <div>
          {hours.map((h) => (
            <div
              key={h}
              className="flex justify-end border-b border-r border-border pr-1.5 pt-0.5 font-mono text-[10px] text-muted-foreground"
              style={{ height: ROW_H }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Tagesspalten */}
        {days.map((day, i) => {
          const timed = itemsOn(day).filter(
            (it) => !it.allDay && it.kind !== "task"
          );
          return (
            <div
              key={i}
              className={cn(
                "relative border-r border-border",
                isSameDay(day, today) && "bg-card-hover/30"
              )}
            >
              {hours.map((h) => (
                <button
                  key={h}
                  onClick={() => onSlotClick(day, `${String(h).padStart(2, "0")}:00`)}
                  className="block w-full border-b border-border transition-colors hover:bg-card-hover/60"
                  style={{ height: ROW_H }}
                  aria-label={`${String(h).padStart(2, "0")}:00 Termin erstellen`}
                />
              ))}

              {timed.map((it) => {
                const { top, height } = blockStyle(it);
                return (
                  <button
                    key={it.id}
                    onClick={() => onEventClick(it)}
                    className="absolute left-1 right-1 overflow-hidden rounded-[6px] px-1.5 py-1 text-left transition-colors hover:brightness-110"
                    style={{
                      top,
                      height,
                      backgroundColor: `color-mix(in oklab, ${it.color} 22%, transparent)`,
                      borderLeft: `3px solid ${it.color}`,
                    }}
                  >
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {it.title}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {format(it.d, "HH:mm")}
                    </p>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListView({ upcoming, onEventClick }) {
  if (upcoming.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <CalendarIcon className="mb-3 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Keine anstehenden Termine.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {upcoming.map((it) => (
        <button
          key={it.id}
          onClick={() => onEventClick(it)}
          className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-card-hover"
        >
          <span className="w-[90px] shrink-0 font-mono text-[12px] text-muted-foreground">
            {format(it.d, "d. MMM", { locale: de })}
          </span>
          <span
            className="h-[26px] w-[3px] shrink-0 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-foreground">{it.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {it.kind === "task" ? "Deadline" : "Termin"}
              {it.projectName ? ` · ${it.projectName}` : ""}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
