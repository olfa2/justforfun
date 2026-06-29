// Reine Berechnungslogik für das Dashboard – nimmt projects + tasks (aus Supabase)
// und leitet alle KPIs und Diagrammdaten ab. Keine externen Abhängigkeiten.

const STATUS_ORDER = ["done", "in_progress", "in_review", "todo", "backlog"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function buildDashboard(projects = [], tasks = []) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const weekAhead = new Date(todayStart);
  weekAhead.setDate(todayStart.getDate() + 7);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const openTasks = tasks.filter((t) => t.status !== "done");
  const activeProjects = projects.filter((p) => p.status === "active");

  // Aktivität der letzten 7 Tage (für Trend-Deltas + Wochenchart)
  const completedThisWeek = doneTasks.filter(
    (t) => t.updated_at && new Date(t.updated_at) >= weekAgo
  ).length;
  const newActiveProjects = activeProjects.filter(
    (p) => p.created_at && new Date(p.created_at) >= weekAgo
  ).length;

  const dueThisWeek = openTasks.filter((t) => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d >= todayStart && d <= weekAhead;
  }).length;

  const completionRate = totalTasks
    ? Math.round((doneTasks.length / totalTasks) * 100)
    : 0;

  // Status-Verteilung (für Donut + Legende), feste Reihenfolge
  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));

  // Wochenaktivität: erledigte Aufgaben pro Tag (letzte 7 Tage, alt -> neu)
  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const key = startOfDay(day).getTime();
    const count = doneTasks.filter(
      (t) => t.updated_at && startOfDay(t.updated_at).getTime() === key
    ).length;
    weekly.push({ date: day, count });
  }

  // Anstehende Deadlines: offene Aufgaben mit Fälligkeit ab heute
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const deadlines = openTasks
    .filter((t) => t.due_date && new Date(t.due_date) >= todayStart)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      title: t.title,
      project: projectMap.get(t.project_id)?.name || "",
      due_date: t.due_date,
      priority: t.priority,
    }));

  // Projektfortschritt: erledigt / gesamt je Projekt
  const progress = projects
    .map((p) => {
      const pt = tasks.filter((t) => t.project_id === p.id);
      const done = pt.filter((t) => t.status === "done").length;
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        status: p.status,
        done,
        total: pt.length,
        pct: pt.length ? Math.round((done / pt.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return {
    kpis: {
      activeProjects: activeProjects.length,
      newActiveProjects,
      openTasks: openTasks.length,
      completedThisWeek,
      dueThisWeek,
      completionRate,
    },
    statusCounts,
    totalTasks,
    doneCount: doneTasks.length,
    weekly,
    deadlines,
    progress,
  };
}
