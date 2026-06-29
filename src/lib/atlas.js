// Atlas-Farb-/Label-Maps für Status & Priorität (CSS-Variablen aus globals.css).

export const STATUS_META = {
  done: { label: "Erledigt", color: "var(--status-done)" },
  in_progress: { label: "In Arbeit", color: "var(--status-in-progress)" },
  in_review: { label: "In Review", color: "var(--status-in-review)" },
  todo: { label: "To Do", color: "var(--status-todo)" },
  backlog: { label: "Backlog", color: "var(--status-backlog)" },
};

export const PRIO_META = {
  urgent: { label: "Dringend", color: "var(--prio-urgent)", bg: "var(--prio-urgent-bg)" },
  high: { label: "Hoch", color: "var(--prio-high)", bg: "var(--prio-high-bg)" },
  medium: { label: "Mittel", color: "var(--prio-medium)", bg: "var(--prio-medium-bg)" },
  low: { label: "Niedrig", color: "var(--prio-low)", bg: "var(--prio-low-bg)" },
};
