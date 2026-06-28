import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

/**
 * Tailwind-Klassen sicher zusammenführen (clsx + tailwind-merge).
 * Beispiel: cn("p-2", condition && "bg-accent", "p-4") -> "bg-accent p-4"
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Initialen aus Name oder E-Mail ableiten (für Avatare). */
export function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const value = String(nameOrEmail).trim();
  if (value.includes("@")) {
    return value.slice(0, 2).toUpperCase();
  }
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministische Farbe aus einem String (z. B. für Avatar-Hintergrund). */
export function stringToColor(str) {
  if (!str) return "#378add";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#378add", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#06b6d4", "#ef4444", "#6366f1",
  ];
  return colors[Math.abs(hash) % colors.length];
}

/** Datum als TT.MM.JJJJ formatieren. */
export function formatDate(date) {
  if (!date) return "";
  return format(new Date(date), "dd.MM.yyyy", { locale: de });
}

/** Datum + Uhrzeit formatieren. */
export function formatDateTime(date) {
  if (!date) return "";
  return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: de });
}

/** Relative Zeitangabe, z. B. "vor 3 Stunden". */
export function timeAgo(date) {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: de });
}

/** Sekunden in "1h 23m" o. Ä. umwandeln (Zeiterfassung). */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Text in einen URL-tauglichen Slug umwandeln (für Workspace-Slugs). */
export function slugify(text) {
  return (
    String(text || "")
      .toLowerCase()
      .replaceAll("ä", "ae")
      .replaceAll("ö", "oe")
      .replaceAll("ü", "ue")
      .replaceAll("ß", "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "workspace"
  );
}
