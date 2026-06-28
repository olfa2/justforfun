// Zentrale Definitionen für Status, Prioritäten und Rollen –
// inkl. deutscher Labels und Badge-Farben. Wird in Kanban, Listen,
// Filtern und Detailansichten wiederverwendet.

export const TASK_STATUSES = [
  { value: "backlog", label: "Backlog", badge: "gray" },
  { value: "todo", label: "Todo", badge: "default" },
  { value: "in_progress", label: "In Arbeit", badge: "blue" },
  { value: "in_review", label: "Review", badge: "purple" },
  { value: "done", label: "Erledigt", badge: "green" },
];

export const TASK_PRIORITIES = [
  { value: "urgent", label: "Dringend", badge: "red" },
  { value: "high", label: "Hoch", badge: "yellow" },
  { value: "medium", label: "Mittel", badge: "blue" },
  { value: "low", label: "Niedrig", badge: "gray" },
];

export const PROJECT_STATUSES = [
  { value: "active", label: "Aktiv", badge: "green" },
  { value: "on_hold", label: "Pausiert", badge: "yellow" },
  { value: "completed", label: "Abgeschlossen", badge: "blue" },
  { value: "archived", label: "Archiviert", badge: "gray" },
];

export const WORKSPACE_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Mitglied" },
  { value: "viewer", label: "Betrachter" },
];

/** Meta-Eintrag (Label/Badge) zu einem Wert aus einer der Listen finden. */
export function getMeta(list, value) {
  return (
    list.find((item) => item.value === value) || {
      value,
      label: value ?? "—",
      badge: "default",
    }
  );
}
