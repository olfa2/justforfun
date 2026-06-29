// Aggregiert time_entries zu KPIs, Wochenchart, Projekt-Aufteilung und letzten
// Einträgen. Reine Logik, keine externen Abhängigkeiten.

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfWeekMon(d) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Montag = 0
  return addDays(x, -day);
}
function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function entrySeconds(e) {
  if (e.duration_seconds != null) return e.duration_seconds;
  if (e.started_at && e.stopped_at) {
    return Math.max(
      0,
      Math.round((new Date(e.stopped_at) - new Date(e.started_at)) / 1000)
    );
  }
  return 0;
}

export function buildTimeStats(entries = [], projects = [], tasks = [], now = new Date()) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  const running = entries.find((e) => !e.stopped_at) || null;
  const finished = entries.filter((e) => e.stopped_at);

  const todayStart = startOfDay(now);
  const weekStart = startOfWeekMon(now);
  const lastWeekStart = addDays(weekStart, -7);
  const monthStart = startOfMonth(now);
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const inRange = (e, a, b) => {
    const t = new Date(e.started_at);
    return t >= a && (!b || t < b);
  };
  const sum = (arr) => arr.reduce((s, e) => s + entrySeconds(e), 0);

  const todaySec = sum(finished.filter((e) => inRange(e, todayStart, null)));
  const weekSec = sum(finished.filter((e) => inRange(e, weekStart, null)));
  const lastWeekSec = sum(finished.filter((e) => inRange(e, lastWeekStart, weekStart)));
  const monthSec = sum(finished.filter((e) => inRange(e, monthStart, null)));
  const lastMonthSec = sum(finished.filter((e) => inRange(e, lastMonthStart, monthStart)));

  const monthEntries = finished.filter((e) => inRange(e, monthStart, null));
  const billableSec = sum(monthEntries.filter((e) => e.billable));
  const billablePct = monthSec ? Math.round((billableSec / monthSec) * 100) : 0;

  // Wochenbalken Mo..So
  const weekly = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const next = addDays(day, 1);
    weekly.push({
      date: day,
      seconds: sum(finished.filter((e) => inRange(e, day, next))),
      isToday: startOfDay(day).getTime() === todayStart.getTime(),
    });
  }

  // Aufteilung nach Projekt (dieser Monat)
  const byProjectMap = new Map();
  for (const e of monthEntries) {
    byProjectMap.set(e.project_id, (byProjectMap.get(e.project_id) || 0) + entrySeconds(e));
  }
  let byProject = [...byProjectMap.entries()]
    .map(([pid, sec]) => {
      const p = projectMap.get(pid);
      return { id: pid, name: p?.name || "Ohne Projekt", color: p?.color, seconds: sec };
    })
    .sort((a, b) => b.seconds - a.seconds);
  const maxProj = byProject[0]?.seconds || 1;
  byProject = byProject
    .map((p) => ({ ...p, pct: Math.round((p.seconds / maxProj) * 100) }))
    .slice(0, 6);

  // Letzte Einträge
  const recent = [...finished]
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
    .slice(0, 6)
    .map((e) => {
      const p = projectMap.get(e.project_id);
      const t = e.task_id ? taskMap.get(e.task_id) : null;
      return {
        id: e.id,
        title: t?.title || e.description || "Zeiteintrag",
        project: p?.name || "",
        color: p?.color,
        billable: e.billable,
        started_at: e.started_at,
        seconds: entrySeconds(e),
        task_id: e.task_id,
        project_id: e.project_id,
      };
    });

  let runningInfo = null;
  if (running) {
    const p = projectMap.get(running.project_id);
    const t = running.task_id ? taskMap.get(running.task_id) : null;
    runningInfo = {
      id: running.id,
      title: t?.title || running.description || "Laufender Timer",
      project: p?.name || "",
      color: p?.color,
      started_at: running.started_at,
    };
  }

  return {
    running: runningInfo,
    kpis: {
      today: todaySec,
      week: weekSec,
      weekDelta: weekSec - lastWeekSec,
      month: monthSec,
      monthDelta: monthSec - lastMonthSec,
      billablePct,
    },
    weekly,
    byProject,
    recent,
  };
}
