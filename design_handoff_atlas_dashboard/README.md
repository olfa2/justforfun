# Handoff: Dashboard-Redesign „Atlas" (Variante A)

## Überblick
Visuelles Redesign des bestehenden Projektmanagement-Dashboards (Next.js 16 / App
Router, Tailwind v4, Supabase). Richtung **„Atlas"**: dunkel, Linear-inspiriert,
ruhig & präzise, mit echter Datenvisualisierung. Akzentfarbe **Indigo**
`oklch(0.66 0.19 280)` (≈ `#7A6CF5`). Sprache durchgehend **Deutsch**.

Dieses Paket beschreibt zwei Screens im neuen Stil — **Dashboard** und **Kanban
Board** — plus das komplette Token-/Komponenten-System, das auf alle übrigen
Seiten (Projekte, Detail, Kalender, Zeiterfassung, Settings, Benachrichtigungen)
übertragen wird.

## Über die Design-Dateien
Die Datei `PM Dashboard Redesign.dc.html` ist eine **Design-Referenz in HTML** —
ein Prototyp, der Aussehen und Aufbau zeigt, **kein** produktiv zu kopierender
Code. Aufgabe ist, diese Designs **in der bestehenden Codebase nachzubauen**:
React-Server/Client-Components, deine vorhandenen shadcn-Komponenten, Tailwind-v4-
Utilities und deine CSS-Variablen-Tokens. Markup, Datenanbindung (Supabase) und
State bleiben deine bestehenden Patterns — nur die UI-Schicht wird ersetzt.

> Die HTML-Referenz enthält **drei** Varianten nebeneinander. Relevant ist nur die
> **linke Spalte**: die Frames mit Label **„A · Dashboard"** und **„A · Kanban"**.
> Varianten B und C ignorieren.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Radien und Zustände sind final und
exakt einzuhalten. Werte stehen in `tokens.css` und unten je Komponente.

---

## Design-System (gilt für ALLE Seiten)

### Flächen-Hierarchie (3 Ebenen)
| Ebene | Farbe | Verwendung |
|---|---|---|
| App-Hintergrund | `#09090B` (`--background`) | Seite |
| Panel / Karte | `#0F0F12` (`--card`) | KPI-Karten, Chart-Karten, Listen |
| Erhöht | `#131316` (`--popover`) | Kanban-Task-Karten, Menüs, Inputs |
| Sidebar-Rail | `#0B0B0E` (`--sidebar`) | linke Icon-Leiste |

Karten tragen **keinen Schlagschatten**, sondern eine 1px-Linie
`border: 1px solid oklch(1 0 0 / 6%)` (`--border`). Tiefe entsteht nur durch die
Flächen-Hierarchie. (Der dicke Schatten in der HTML-Referenz ist nur die
Frame-Darstellung auf der Canvas — **nicht** übernehmen.)

### Text
| Rolle | Farbe | Beispiel |
|---|---|---|
| Primär | `#ECECEE` (`--foreground`) | Überschriften, Werte |
| Sekundär | `#C7C7CC` / `#E4E4E7` | Listentext |
| Muted | `#8B8B93` (`--muted-foreground`) | Labels, Untertitel |
| Faint | `#52525B` | Achsenbeschriftung, Disabled |

### Typografie
- **Geist** — gesamtes UI. (Linear-nahe Alternative zu Inter. Wer bei Inter
  bleiben will: 1:1 ersetzbar.)
- **Geist Mono** — alle **Zahlen**, **Uppercase-Labels** und Code-artige Kürzel
  (KPI-Werte, Counts, `⌘K`, Datumsangaben, Avatare-Initialen).
- Über `next/font/google` laden (siehe `tokens.css`).

### Radien
| Element | Radius |
|---|---|
| Karten / Panels | `12–13px` |
| Buttons, Inputs, Spalten | `9–12px` |
| Kanban-Karte | `9px` |
| Rail-Icons | `10px` |
| Badges (Status/Prio) | `5–6px` |
| Pills (Aktiv-Status) | `20px` (voll) |
| Avatare | `50%` |

### Akzent-Einsatz (Indigo `--primary`)
Sparsam. Nur für: Primär-Button, aktives Nav-Icon (Tint-Fläche
`oklch(0.66 0.19 280 / .14)` + Icon `oklch(0.78 0.13 280)`), Fokus-Ring,
„Alle anzeigen"-Links, das gefüllte Logo-Quadrat oben in der Rail. **Nicht** für
Fließtext, nicht für ganze Karten-Hintergründe.

### Status-Farben (Task-Status — überall identisch)
| Status (DB) | Label | Farbe |
|---|---|---|
| `done` | Erledigt | `oklch(0.72 0.15 150)` (grün) |
| `in_progress` | In Arbeit | `oklch(0.70 0.13 245)` (blau) |
| `in_review` | In Review | `oklch(0.70 0.15 300)` (violett) |
| `todo` | To Do | `oklch(0.80 0.13 85)` (amber) |
| `backlog` | Backlog | `oklch(0.62 0.02 260)` (grau) |

### Prioritäts-Badges (Text auf Tint, Radius 5px, 10px Mono, Padding `2px 7px`)
| Prio (DB) | Label | Text | Hintergrund |
|---|---|---|---|
| `urgent` | Dringend | `oklch(0.78 0.13 25)` | `oklch(0.65 0.20 25 / .16)` |
| `high` | Hoch | `oklch(0.82 0.12 60)` | `oklch(0.72 0.16 55 / .16)` |
| `medium` | Mittel | `oklch(0.80 0.10 245)` | `oklch(0.70 0.13 245 / .16)` |
| `low` | Niedrig | `oklch(0.74 0.02 260)` | `oklch(0.62 0.02 260 / .18)` |

### Avatar-Farben (Mitglieder, zyklisch zuweisen)
`#8b5cf6` · `#6366f1` · `#0ea5e9` · `#ec4899`. Größe 21–24px, weiße Initialen
9px Geist Mono 600. In Stacks: `margin-left:-8px`, `2px solid var(--card)` Rand.

---

## Persistente Chrome: Sidebar-Rail (auf jeder Seite)
- **Breite 60px**, Hintergrund `--sidebar`, rechte Linie `oklch(1 0 0 / 5%)`,
  vertikaler Flex, zentriert, `padding:14px 0`, `gap:4px`.
- Oben: **Logo-Quadrat** 32×32, Radius 9px, Fläche `--primary`, weißes Grid-Icon.
  Darunter 10px Abstand.
- **Nav-Icons** (6): je 38×38, Radius 10px, Stroke-Icons 19px `stroke-width:1.8`.
  - Aktiv: Fläche `oklch(0.66 0.19 280 / .14)`, Icon `oklch(0.78 0.13 280)`.
  - Inaktiv: Icon `#71717A`, keine Fläche; Hover → Fläche `#16161A`.
  - Reihenfolge: Dashboard (Grid) · Projekte (Ordner) · Kalender · Zeiterfassung
    (Uhr) · Benachrichtigungen (Glocke) · Einstellungen (Zahnrad).
- Ganz unten (`margin-top:auto`): **Avatar** 32×32, rund, Initialen „RE".
- Verhalten wie heute: eingeklappt = nur Icons; bei Hover Flyout mit Labels
  (Workspace-Switcher oben, Theme-Toggle + User + Abmelden unten) — bestehende
  Logik beibehalten, nur Optik gemäß Tokens.

---

## Screen 1 — Dashboard (`/dashboard`)

**Zweck:** Schnellüberblick: Kennzahlen, Status-Verteilung, Wochenaktivität,
anstehende Deadlines, Projektfortschritt.

**Layout:** Rail (60px) + Main (flex-1).
Main = Header (sticky, 1px Bottom-Border) über scrollbarem Content.
Content-Padding `24px 28px`, vertikaler `gap:18px`.

### Header
- Padding `22px 28px`, Bottom-Border `oklch(1 0 0 / 5%)`.
- Links: Titel **„Übersicht"** 19px/600, `letter-spacing:-.01em`; darunter
  „Willkommen zurück, {username}" 13px `--muted-foreground`.
- Rechts (Flex, gap 10px):
  - **Suchfeld** (Optik, ⌘K-Hinweis): Höhe 34px, Breite 200px, `#101013`,
    Border `--border`, Radius 9px, Lupe-Icon 14px + „Suchen" 13px `#71717A`,
    rechts Kbd-Chip „⌘K" 11px Mono in 1px-Box.
  - **Primär-Button „Neues Projekt"**: Höhe 34px, Padding `0 14px`, Fläche
    `--primary`, Radius 9px, weißer Text 13px/500, Plus-Icon 15px.

### KPI-Reihe (4 Karten, `grid-cols-4`, gap 14px)
Karte: `--card`, Border, Radius 13px, Padding `16px 18px`.
- Label: 11px **Geist Mono**, uppercase, `letter-spacing:.04em`, `#71717A`.
- Wert: 30px/600 **Geist Mono**, `line-height:.9`, `letter-spacing:-.02em`,
  daneben (baseline) Delta 12px Mono in `--positive` (`oklch(0.74 0.14 155)`).
- Inhalte: **Aktive Projekte** `4` `+1` · **Offene Aufgaben** `38` `−6` ·
  **Fällig diese Woche** `7` · **Abschlussrate** `68%` `+12%`.

### Chart-Reihe (`grid-template-columns: 1.1fr 1.2fr 1fr`, gap 14px)
Alle drei: `--card`, Border, Radius 13px, Padding `18px 20px`.

**a) „Aufgaben nach Status" — Donut + Legende**
- Titel 13px/600; Subtitel „64 Aufgaben gesamt" 12px muted.
- Donut: SVG 124×124, Ring `r=54`, Strichbreite 14, Track `#1C1C20`.
  Segmente in Status-Reihenfolge (done→in_progress→in_review→todo→backlog),
  Start oben (−90°), im Uhrzeigersinn, anteilig (26/9/4/11/14 von 64).
  Mitte: „68%" 23px Mono / „erledigt" 10px muted.
  *(In React am einfachsten als gestapeltes `stroke-dasharray` ODER mit Recharts
  `<PieChart innerRadius outerRadius>` — Farben = `--chart-1..5`.)*
- Legende rechts: je Zeile Farbpunkt 9px (Radius 3px) + Label + Count (Mono,
  rechtsbündig, muted).

**b) „Wochenaktivität" — Area-/Linien-Chart**
- Kopf: Titel + rechts „erledigte Aufgaben" 11px Mono muted; Subtitel
  „letzte 7 Tage".
- Werte Mo–So: `[3,5,2,6,4,7,5]`. Linie 2.2px `oklch(0.72 0.16 280)`, darunter
  Verlaufs-Füllung von `oklch(0.66 0.19 280 / .28)` → transparent. Punkte 2.6px
  (Fill `--card`, Stroke Akzent). X-Achse Mo–So 10px Mono `#52525B`.
  *(Recharts `<AreaChart>` mit `<linearGradient>`-Fill.)*

**c) „Anstehende Deadlines" — Liste**
- Titel 13px/600. Je Eintrag: 3px-Farbstrich (Höhe 30px, Status-/Prio-Farbe) +
  Titel 13px `#E4E4E7` (1 Zeile, ellipsis) über Projektname 11px muted; rechts
  Datum 11px Mono `#A1A1AA`.
- Daten: „Newsletter-Template testen / Email-Kampagne / **Heute**" (rot) ·
  „Hero-Section finalisieren / Website Relaunch / 30. Jun" (orange) ·
  „Onboarding-Texte freigeben / Onboarding Flow / 2. Jul" (blau).

### „Projektfortschritt" (volle Breite)
Karte `--card`, Border, Radius 13px, Padding `18px 20px`.
- Kopf: Titel „Projektfortschritt" 13px/600; rechts Link „Alle anzeigen"
  12px `oklch(0.78 0.13 280)`.
- Je Projekt (Flex-Zeile, gap 16px): Name 13.5px (200px breit, ellipsis) ·
  Fortschrittsbalken (flex-1, Höhe 7px, Track `#1A1A1E`, Radius 4px, Füllung in
  Projektfarbe) · Prozent 12.5px Mono muted (42px, rechts) · Avatar-Stack.
- Daten: Email-Kampagne 72 % (grün) · Website Relaunch 45 % (blau) ·
  Onboarding Flow 88 % (violett) · Mobile App 23 % (amber). Balkenfarbe = jeweilige
  Status-/Akzentfarbe.

---

## Screen 2 — Kanban Board (Projekt-Detail / Board-Ansicht)

**Zweck:** Tasks eines Projekts nach Status, Drag & Drop (bestehendes `@dnd-kit`
beibehalten — nur Optik anpassen).

**Container:** `--background`, Padding `22px 24px`.
- **Board-Header:** links Projektname 16px/600 + Aktiv-Pill (11px,
  `oklch(0.74 0.14 155)` auf `/.12`-Tint, Radius 20px). Rechts „Filter"-Button
  (`#101013`, Border, Radius 8px) + „+ Aufgabe" (Akzent-Button, Radius 8px).
- **5 Spalten** (`grid-cols-5`, gap 12px, `align-items:start`):
  - Spalte: `#0C0C0F`, Border `oklch(1 0 0 / 5%)`, Radius 12px, Padding 12px,
    `min-height:300px`.
  - Spalten-Header: Status-Farbpunkt 8px + Name 12.5px/600 `#D4D4D8` + Count
    (rechts, 11px Mono `#52525B`). Reihenfolge: Backlog · To Do · In Arbeit ·
    In Review · Erledigt.
  - **Task-Karte** (`--popover` `#131316`, Border, Radius 9px, Padding `11px 12px`,
    gap 9px untereinander):
    - Titel 12.5px `#E4E4E7`, `line-height:1.4`.
    - Fußzeile (Flex, gap 6px): **Prio-Badge** (siehe Tabelle) · **Tag-Chip**
      (10px `#71717A` auf `#1C1C20`, Radius 5px) · rechts **Avatar** 21px.

**Beispiel-Tasks** (zum Nachbauen, echte Daten aus Supabase):
- Backlog (3): „Wettbewerbsanalyse Mailprovider" (Niedrig/Research/RT) ·
  „Datenschutz-Check DSGVO" (Mittel/Legal/MK) · „Bildmaterial sammeln"
  (Niedrig/Design/LS).
- To Do (3): „Newsletter-Template aufsetzen" (Hoch/Frontend/LS) ·
  „Empfängerliste segmentieren" (Mittel/Data/MK) · „Betreffzeilen A/B planen"
  (Niedrig/Marketing/JD).
- In Arbeit (2): „Hero-Section finalisieren" (Dringend/Design/LS) ·
  „Tracking-Pixel einbauen" (Hoch/Backend/RT).
- In Review (1): „Onboarding-Texte freigeben" (Mittel/Content/JD).
- Erledigt (2): „SMTP-Server konfigurieren" (Hoch/Infra/RT) ·
  „Markenrichtlinien anlegen" (Niedrig/Design/LS).

---

## Interaktionen & Zustände
- **Hover Karten/Buttons:** Hintergrund eine Stufe heller (`--card`→`#141417`,
  Buttons +6 % Helligkeit), Übergang `120ms ease`.
- **Hover Nav-Icon (inaktiv):** Fläche `#16161A` einblenden.
- **Fokus (Inputs/Buttons):** Ring 2px `--ring` (`oklch(0.66 0.19 280)`),
  `outline-offset:2px`.
- **Drag (Kanban):** angehobene Karte leicht skalieren (`scale(1.02)`) + Schatten
  `0 8px 24px rgba(0,0,0,.4)`; Ziel-Spalte bekommt 1px-Akzent-Innenrand.
- **Leerzustände** (Kalender/Zeiterfassung/Benachrichtigungen): zentriert, runde
  Icon-Kachel 64px auf `--popover`, Titel 600 + Subtitel muted — Stil wie heute,
  nur Tokens angleichen.
- **Theme-Toggle:** Dark ist Default/primär. Für Light-Mode dieselben semantischen
  Token in `:root` invertieren (separat lieferbar, falls gewünscht).

## Datenanbindung (unverändert)
Bestehende Supabase-Abfragen/RLS beibehalten. UI liest:
- KPIs aus Aggregaten über `projects` / `tasks` (Counts nach `status`).
- Donut/Legende: `count(tasks) group by status`.
- Wochenaktivität: erledigte Tasks pro Tag (letzte 7 Tage).
- Deadlines: nächste Tasks nach `due_date`, Farbe nach `priority`/Dringlichkeit.
- Projektfortschritt: `done / total` je Projekt.

## Design-Tokens
Vollständig in **`tokens.css`** (in diesem Ordner) — fertig für deinen
`.dark`-Block in `globals.css`, plus optionaler `@theme inline`-Block für
semantische Utilities (`bg-status-done`, `text-prio-urgent` …) und der
`next/font`-Setup für Geist / Geist Mono.

## Assets
- **Fonts:** Geist, Geist Mono (Google Fonts / `next/font`).
- **Icons:** schlanke Stroke-Icons (`stroke-width:1.8`). Empfehlung: **lucide-react**
  (du nutzt vermutlich bereits lucide) — Mapping: `LayoutGrid`, `Folder`/`FolderKanban`,
  `Calendar`, `Clock`, `Bell`, `Settings`, `Search`, `Plus`, `LogOut`.
- Keine Bild-Assets nötig; alle Diagramme sind datengetrieben.

## Dateien
- `PM Dashboard Redesign.dc.html` — HTML-Referenz aller Frames. **Nur Variante A
  (linke Spalte, Labels „A · Dashboard" / „A · Kanban")** ist maßgeblich.
- `tokens.css` — Farb-/Radius-/Font-Tokens für Tailwind v4 / shadcn.
- `README.md` — dieses Dokument.

### So nutzt du es in Claude Code
1. Ordner `design_handoff_atlas_dashboard/` ins Repo legen.
2. In Claude Code z. B.: *„Lies `design_handoff_atlas_dashboard/README.md` und
   `tokens.css`. Übernimm die Tokens in `globals.css` und baue zuerst das
   Dashboard (`/dashboard`) gemäß Spezifikation in unseren bestehenden
   Komponenten nach — Daten/Supabase unverändert."*
3. Danach Kanban, dann restliche Seiten mit demselben Token-System.
