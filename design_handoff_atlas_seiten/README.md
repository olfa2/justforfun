# Handoff: Atlas — Weitere Seiten (Kalender · Benachrichtigungen · Zeiterfassung)

## Überblick
Ergänzung zum Dashboard-Redesign **„Atlas"** (Variante A) für das
Projektmanagement-Dashboard (Next.js 16 / App Router, Tailwind v4, Supabase).
Dieses Paket spezifiziert **drei weitere Seiten** im selben Stil:

1. **Kalender** (`/calendar`)
2. **Benachrichtigungen** (`/notifications`)
3. **Zeiterfassung** (`/time-tracking`)

Dunkel, Linear-inspiriert, ruhig & präzise. Akzent **Indigo**
`oklch(0.66 0.19 280)` (≈ `#7A6CF5`). Sprache durchgehend **Deutsch**.

> Dashboard und Kanban sind bereits im ersten Paket
> (`design_handoff_atlas_dashboard/`) beschrieben — hier **nicht** enthalten.

## Über die Design-Dateien
`PM Dashboard Redesign.dc.html` ist eine **HTML-Referenz** (Prototyp), kein
Produktivcode. Aufgabe: diese Screens **in der bestehenden Codebase nachbauen**
(React-Components, vorhandene shadcn-Komponenten, Tailwind-v4-Utilities,
CSS-Variablen-Tokens). Daten/Supabase-Anbindung bleibt euer bestehendes Pattern —
nur die UI-Schicht wird ersetzt.

> Relevant ist nur die **linke Spalte** (Variante A). Maßgebliche Frames:
> **„A · Kalender"**, **„A · Benachrichtigungen"**, **„A · Zeiterfassung"**.
> Varianten B und C sowie die Dashboard-/Kanban-Frames ignorieren.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Radien sind final. Token-Werte in
`tokens.css`; Layout-Details unten je Seite.

---

## Gemeinsame Grundlagen (gelten für alle drei Seiten)

### Flächen-Hierarchie
| Ebene | Farbe (Token) | Verwendung |
|---|---|---|
| App-Hintergrund | `#09090B` (`--background`) | Seite |
| Panel / Karte | `#0F0F12` (`--card`) | Karten, Listen, Charts |
| Erhöht | `#131316` / `#16161A` (`--popover`) | Inputs, Icon-Tiles, Chips |
| Sidebar-Rail | `#0B0B0E` (`--sidebar`) | linke Icon-Leiste |

Karten: 1px-Linie `oklch(1 0 0 / 6%)` (`--border`), **kein** Schlagschatten.
(Der dicke Schatten in der HTML-Referenz ist nur die Canvas-Frame-Darstellung.)

### Text
Primär `#ECECEE` · Sekundär `#C7C7CC`/`#E4E4E7`/`#D4D4D8` · Muted `#8B8B93`/`#A1A1AA`
· Faint `#71717A`/`#52525B`.

### Typografie
- **Geist** — gesamtes UI.
- **Geist Mono** — alle **Zahlen**, **Uppercase-Labels** (z. B. „HEUTE", „LÄUFT",
  Wochentagskürzel), Uhrzeiten, Zeitstempel, Dauern, Avatar-Initialen.

### Sidebar-Rail (auf jeder Seite identisch, 60px)
Hintergrund `--sidebar`, rechte Linie `oklch(1 0 0 / 5%)`. Oben Logo-Quadrat
32×32 (Radius 9px, Fläche `--primary`, weißes Grid-Icon). Darunter 6 Nav-Icons
38×38 (Radius 10px, Stroke 1.8, 19px). Aktiv = Fläche `oklch(0.66 0.19 280 / .14)`
+ Icon `oklch(0.78 0.13 280)`; inaktiv = Icon `#71717A`. Reihenfolge:
**Dashboard (Grid) · Projekte (Ordner) · Kalender · Zeiterfassung (Uhr) ·
Benachrichtigungen (Glocke) · Einstellungen (Zahnrad)**. Unten (`margin-top:auto`)
Avatar 32×32 rund. Je Seite ist das entsprechende Icon aktiv.

### Seiten-Header (überall gleich aufgebaut)
Padding `22px 28px`, Bottom-Border `oklch(1 0 0 / 5%)`. Links Titel 19px/600
(`letter-spacing:-.01em`) + Untertitel 13px `--muted-foreground`. Rechts die
seitenspezifischen Aktionen (siehe je Seite).

### Status-/Prioritätsfarben (wie im Dashboard-Paket)
done `oklch(0.72 0.15 150)` · in_progress `oklch(0.70 0.13 245)` ·
in_review `oklch(0.70 0.15 300)` · todo `oklch(0.80 0.13 85)` ·
backlog `oklch(0.62 0.02 260)`. urgent `oklch(0.65 0.20 25)` ·
high `oklch(0.72 0.16 55)`. Events/Chips nutzen diese Töne auf `/.14–.16`-Tint.

---

## Seite 1 — Kalender (`/calendar`)

**Zweck:** Termine, Deadlines & Events als Monatsansicht (plus Woche/Liste-Toggle).
Daten aus `events` + Task-`due_date`s, gefärbt nach Projekt/Priorität.

**Layout:** Rail (60px) + Main. Main = Header über zweispaltigem Body
(Monatsgitter `flex-1` + rechtes Panel `320px`, Trennlinie links).

### Header
Titel **„Kalender"**, Untertitel „Termine, Deadlines & Events". Rechts (Flex,
gap 10px):
- **Monatsnavigation:** zwei 32×32-Buttons (`#101013`, Border, Radius 8px) mit
  Chevron-links/-rechts.
- **Monats-Label** „Juni 2026" 15px/600, min-width 120px.
- **„Heute"-Button** (Höhe 34px, `#101013`, Border, Radius 9px).
- **Segmented-Control** Monat / Woche / Liste (`#101013`-Box, Padding 3px;
  aktiv = `oklch(0.66 0.19 280 / .16)`-Tint + Text `oklch(0.80 0.12 280)`).
- **Primär-Button „Neuer Termin"** (Akzent, Radius 9px, Plus-Icon).

### Monatsgitter (links)
- Padding `20px 24px 24px`.
- **Wochentagskopf:** 7-Spalten-Grid, Kürzel **Mo Di Mi Do Fr So** [So], 11px
  Geist Mono uppercase `letter-spacing:.06em` `#71717A`. **Wochenstart Montag.**
- **Gitter:** umrahmt (`border: 1px solid oklch(1 0 0 / 6%)`, Radius 12px,
  `overflow:hidden`). 5 Wochenreihen, je `grid-cols-7`, Reihen durch 1px-Linien
  getrennt. Zellen: `min-height:104px`, rechte 1px-Trennlinie, Padding `7px 8px`,
  vertikaler `gap:4px`.
  - **Tageszahl** oben rechts, 12px Geist Mono, in 22×22-Kreis.
    - Heute (29.): Kreis-Fläche `--primary`, Zahl `#fff` 600.
    - Normaler Tag: Zahl `#A1A1AA`, kein Kreis.
    - Anderer Monat (Jul 1–5): Zellen-Hintergrund `#0C0C0F`, Zahl `#52525B`.
  - **Events** als getönte Pills: `padding:2px 6px`, Radius 5px, Hintergrund
    Event-Tint; darin 6px-Farbpunkt (Statusfarbe) + Titel 11px `#D4D4D8`
    (1 Zeile, ellipsis). Max **3** Events sichtbar; Rest als
    „+N weitere" 10px Mono `#71717A`.

### Rechtes Panel (320px)
- **Tagesagenda:** Überschrift „Montag, 29. Juni" 15px/600 + „Heute"-Label 11px
  `oklch(0.78 0.13 280)`. Darunter Einträge (Border-Bottom-Trenner): Uhrzeit
  (42px, 12px Mono `#A1A1AA`) · 3px-Farbstrich (Status) · Titel 13px `#E4E4E7`
  über Meta 11px muted.
- **Legende „Kalender":** Label (Mono uppercase) + Zeilen mit Farbpunkt 10px +
  Projektname + rechts 15×15-Farb-Checkbox. Projekte: Email-Kampagne (grün),
  Website Relaunch (blau), Onboarding Flow (violett), Mobile App (amber),
  Persönlich (grau).

**Umsetzungshinweis:** Monatsraster mit `date-fns`
(`startOfMonth`/`endOfMonth`/`eachDayOfInterval`, `weekStartsOn: 1`). Events nach
Tag bucketten; pro Zelle 3 zeigen + Overflow-Zähler. Woche-/Liste-Ansicht sind als
Toggle vorgesehen, aber noch nicht ausgestaltet (separat lieferbar).

---

## Seite 2 — Benachrichtigungen (`/notifications`)

**Zweck:** Aktivitäten & Hinweise aus Projekten, chronologisch gruppiert, mit
Gelesen-/Ungelesen-Status. Quelle: Aktivitäts-Events (Kommentare, Zuweisungen,
Erwähnungen, Statuswechsel, Deadlines).

**Layout:** Rail + Main. Main = Header über **zentrierter** Inhaltsspalte
(`max-width:840px`, Wrapper `display:flex; justify-content:center`,
Padding `22px 28px 28px`, Gruppen-`gap:24px`).

### Header
Titel **„Benachrichtigungen"** + **Zähler-Badge** (ungelesene Anzahl, 11px Mono,
weiß auf `--primary`, Radius 20px, Padding `2px 8px`). Untertitel „Aktivitäten und
Hinweise aus deinen Projekten". Rechts:
- **Segmented-Control** Alle / Ungelesen / Erwähnungen (Stil wie Kalender-Toggle).
- **„Alle als gelesen"** (Button `#101013`, Border, Radius 9px, Häkchen-Icon).

### Gruppen & Einträge
- **Gruppentitel** (Heute / Gestern / Diese Woche): 11px Geist Mono uppercase
  `letter-spacing:.06em` `#71717A`, `margin-bottom:8px`.
- **Eintrag** (Flex-Zeile, `gap:13px`, Padding `13px 14px`, Radius 11px):
  - **Ungelesen:** Zeilen-Hintergrund `oklch(0.66 0.19 280 / .055)` + 8px-Indigo-
    Punkt rechts. Gelesen: transparent, kein Punkt.
  - **Avatar** 34×34 rund (Akteur-Initialen, weiß 12px Mono 600, Avatarfarbe) —
    ODER für **System-/Deadline-Hinweise** eine 34×34-Icon-Kachel (Radius 9px):
    z. B. Deadline = rote Kachel (`oklch(0.65 0.20 25 / .14)` + Uhr-Icon
    `oklch(0.74 0.16 25)`).
  - **Text** 13.5px `#C7C7CC`, `line-height:1.5`; Akteurname **`#F4F4F5` 600**,
    Ziel/Objekt **`#F4F4F5` 500**, Rest normal. (Bei System-Hinweisen ist das
    „Objekt" der Aufgabentitel, fett am Satzanfang.)
  - **Meta-Zeile:** Projekt-/Status-Chip (11px `#A1A1AA` auf `#16161A`, Border,
    Radius 5px, 7px-Farbpunkt, `white-space:nowrap`) + Zeitstempel 11px Mono
    `#71717A`.

**Beispiel-Einträge** (Mapping eurer Event-Typen → UI):
- *Statuswechsel:* „**Lena Schulz** hat „Hero-Section finalisieren“ in **In Review**“
  · Chip Website Relaunch (blau) · vor 12 Min · ungelesen.
- *Deadline (System):* „**Newsletter-Template testen** ist heute fällig“ ·
  rote Uhr-Kachel · Chip Dringend (rot) · vor 1 Std · ungelesen.
- *Erwähnung:* „**Max Keller** hat dich in einem Kommentar erwähnt: **Tracking-Pixel
  einbauen**“ · Chip Email-Kampagne (grün) · vor 2 Std · ungelesen.
- *Zuweisung:* „**Jana Doll** hat dir **Onboarding-Texte freigeben**“ · gelesen.
- *Bulk-Status:* „**Rei Tanaka** hat 6 Aufgaben als erledigt markiert in **Mobile
  App**“ · gelesen.

**Leerzustand** (keine Benachrichtigungen): zentrierte 64px-Glocken-Kachel auf
`--popover`, Titel „Keine Benachrichtigungen" 600 + Subtitel muted (Stil eures
bisherigen Empty-States, nur Tokens angleichen).

---

## Seite 3 — Zeiterfassung (`/time-tracking`)

**Zweck:** Laufenden Timer steuern, Wochenüberblick, Aufteilung nach Projekt und
letzte Zeiteinträge. Quelle: `time_entries` (+ Bezug auf `tasks`/`projects`).

**Layout:** Rail + Main. Header über Content (Padding `24px 28px`, `gap:18px`).

### Header
Titel **„Zeiterfassung"** + Untertitel „Timer und Zeiteinträge". Rechts:
**„Bericht"** (Button `#101013`, Border, Chart-Icon) + Primär-Button
**„Eintrag hinzufügen"** (Akzent, Plus-Icon).

### Timer-Hero (volle Breite)
Karte mit dezentem Akzent-Verlauf links
(`linear-gradient(100deg, oklch(0.66 0.19 280 / .10), #0F0F12 60%)`), Border
`oklch(0.66 0.19 280 / .25)`, Radius 14px, Padding `22px 26px`, Flex
`align-items:center; gap:24px`:
- **Links (flex-1):** „LÄUFT"-Label (grüner Puls-Punkt mit Glow `box-shadow:0 0 0
  4px …/.18` + 11px Mono `oklch(0.78 0.13 145)` uppercase) · Task-Titel 18px/600
  `#F4F4F5` · Projekt-Zeile (8px-Farbpunkt + Name 13px `#A1A1AA`).
- **Mitte/rechts:** großer Timer **`01:24:36`** 46px/600 **Geist Mono**,
  `letter-spacing:-.02em`, weiß.
- **Rechts:** Pause-Button 48×48 (`#1A1A1E`, Border, Radius 12px) +
  **„Stoppen"** (Höhe 48px, Fläche `oklch(0.62 0.21 18)` rot, Radius 12px,
  Stop-Icon, weiß 600).

### KPI-Reihe (4, `grid-cols-4`, gap 14px)
Karte `--card`, Border, Radius 13px, Padding `16px 18px`. Label 11px Mono uppercase
muted; Wert 26px/600 Geist Mono + optionales Delta 12px Mono `--positive`.
Inhalte: **Heute** `5h 12m` · **Diese Woche** `28h 45m` `+3h` · **Dieser Monat**
`112h` `+18h` · **Abrechenbar** `84%`.

### Wochenchart + Projekt-Aufteilung (`grid-template-columns: 1.5fr 1fr`, gap 14px)
- **„Diese Woche"** (Balken): Kopf Titel + „Ziel 8h / Tag" (11px Mono muted);
  Subtitel „28h 45m erfasst". Balkenreihe (Höhe 150px): je Tag Wert oben (10.5px
  Mono `#A1A1AA`), Balken (max-width 38px, Radius `6px 6px 3px 3px`, Höhe =
  `h/8×100%`), Wochentag unten. **Heute (Fr)** in `--primary` (Indigo), volle Tage
  blau `oklch(0.66 0.13 245)`, Teiltage gedämpft `oklch(0.55 0.10 250)`. Werte:
  Mo 6,5 · Di 7 · Mi 5,5 · Do 8 · Fr 1,7 (heute) · Sa/So –.
- **„Nach Projekt"** (Liste mit Balken): je Projekt Zeile mit Farbpunkt 8px +
  Name + Dauer (rechts, Mono) über Balken (Höhe 6px, Track `#1A1A1E`, Füllung
  Projektfarbe). Email-Kampagne 12h 10m (100 %) · Website Relaunch 9h 05m (75 %) ·
  Mobile App 5h 20m (44 %) · Onboarding Flow 2h 10m (18 %).

### „Letzte Einträge" (volle Breite)
Karte `--card`, Border, Radius 13px. Kopf: Titel + „Alle anzeigen"
(`oklch(0.78 0.13 280)`). Zeilen (Border-Bottom-Trenner, Padding `13px 0`,
`gap:14px`): 8px-Projektpunkt · Task-Titel 13.5px `#E4E4E7` über Projekt 11.5px
muted · **„Abrechenbar"**-Chip (10px `oklch(0.78 0.13 155)` auf
`oklch(0.72 0.15 150 / .12)`, Radius 5px) nur wenn abrechenbar · Zeitpunkt
(12px Mono muted, 90px rechts) · **Dauer** 15px/600 Mono `#F4F4F5` (60px rechts) ·
32×32-Resume-Button (`#16161A`, Border, Play-Icon).

**Umsetzungshinweis:** Timer als Client-Component mit `setInterval` (Sekunden),
Persistenz des Start-Timestamps in `time_entries` (laufender Eintrag = ohne
`end`). Dauer-Format `H:MM` bzw. `HH:MM:SS` für den laufenden Timer.

---

## Interaktionen & Zustände (alle Seiten)
- **Hover** Karten/Buttons: Hintergrund eine Stufe heller (`120ms ease`).
- **Hover** Kalender-Tag / Notif-Zeile / Eintrag: leichte Flächenaufhellung
  (`#101013`/`#131316`).
- **Fokus:** Ring 2px `--ring` (`oklch(0.66 0.19 280)`), `outline-offset:2px`.
- **Timer-Puls:** dezente Pulse-Animation am „LÄUFT"-Punkt.
- **Light-Mode:** dieselben semantischen Token in `:root` invertieren (separat
  lieferbar).

## Datenanbindung (unverändert)
Bestehende Supabase-Abfragen/RLS beibehalten:
- **Kalender:** `events` + Task-`due_date`s im Monatszeitraum, Farbe nach
  Projekt/Priorität.
- **Benachrichtigungen:** Aktivitäts-Events des Nutzers, sortiert nach Zeit,
  Gruppierung nach Tag; `read`-Flag für Ungelesen-Status.
- **Zeiterfassung:** `time_entries` des Nutzers — laufender Eintrag, Aggregate
  (Tag/Woche/Monat), Summen je Projekt, letzte Einträge.

## Assets
- **Fonts:** Geist, Geist Mono (`next/font/google` — Setup in `tokens.css`).
- **Icons:** lucide-react. Mapping: `Calendar`, `ChevronLeft`/`ChevronRight`,
  `Plus`, `Check`, `Bell`, `Clock`, `Pause`, `Square` (Stop), `Play`, `BarChart3`.
- Keine Bild-Assets nötig.

## Dateien
- `PM Dashboard Redesign.dc.html` — HTML-Referenz. Maßgeblich:
  **„A · Kalender" · „A · Benachrichtigungen" · „A · Zeiterfassung"**.
- `tokens.css` — identisch zum ersten Paket (Farb-/Radius-/Font-Tokens).
- `README.md` — dieses Dokument.

### So nutzt du es in Claude Code
1. Ordner `design_handoff_atlas_seiten/` ins Repo legen (neben dem ersten Paket).
2. In Claude Code z. B.: *„Lies `design_handoff_atlas_seiten/README.md`. Die
   Atlas-Tokens stecken bereits in `globals.css`. Baue die Kalender-Seite
   (`/calendar`) gemäß Spezifikation in unseren bestehenden Komponenten nach —
   Daten/Supabase unverändert. Danach Benachrichtigungen und Zeiterfassung."*
3. Tokens sind schon gesetzt (aus dem ersten Paket) — hier nur die Screens bauen.
