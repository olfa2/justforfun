# Handoff: Atlas — Startseite / Login (`/login`)

## Überblick
Redesign der **Anmelde-/Startseite** im Atlas-Stil (Variante A) für das
Projektmanagement-Dashboard (Next.js 16 / App Router, Tailwind v4, Supabase Auth).
Dunkel, Linear-inspiriert, Akzent **Indigo** `oklch(0.66 0.19 280)` (≈ `#7A6CF5`).
Sprache **Deutsch**.

Ersetzt die bisherige helle, mittig zentrierte Karte durch ein **Split-Screen-
Layout**: links Produkt-Showcase, rechts Anmeldeformular.

## Über die Design-Dateien
`PM Dashboard Redesign.dc.html` ist eine **HTML-Referenz** (Prototyp), kein
Produktivcode. Aufgabe: den Screen **in der bestehenden Codebase nachbauen** (eure
Auth-Komponente, shadcn-Inputs/Buttons, Tailwind-v4-Utilities, CSS-Variablen).
Die **Supabase-Auth-Logik bleibt unverändert** — nur die UI-Schicht wird ersetzt.

> Maßgeblicher Frame: **„A · Login"**. Alle anderen Frames (Dashboard, Kanban,
> Kalender etc. sowie Varianten B/C) ignorieren.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Radien sind final. Token-Werte in
`tokens.css`.

---

## Layout
Vollflächiger dunkler Screen (`#09090B`), zweispaltig:

- **Showcase-Panel (links, 600px fix):** `#0B0B0E`, rechte 1px-Linie
  `oklch(1 0 0 / 5%)`, Padding `44px 48px`, `position:relative; overflow:hidden`.
- **Formular-Panel (rechts, flex-1):** `#09090B`, Inhalt vertikal + horizontal
  zentriert, Formularbreite `max-width:380px`.

> **Responsive:** Unter ~900px Breite das Showcase-Panel ausblenden und nur das
> zentrierte Formular zeigen (mit kleinem Logo darüber).

---

## Showcase-Panel (links)

### Hintergrund-Glow (rein dekorativ)
Zwei weiche Radial-Verläufe, absolut positioniert, hinter dem Inhalt:
- oben links: `radial-gradient(circle, oklch(0.66 0.19 280 / .22), transparent 65%)`,
  ~420px, leicht `blur(8px)`.
- unten rechts: `radial-gradient(circle, oklch(0.62 0.16 295 / .14), transparent 65%)`,
  ~480px.

### Inhalt (über dem Glow, `position:relative`)
- **Oben — Logo-Lockup:** 36×36-Quadrat (Radius 10px, Fläche `--primary`, weißes
  Grid-Icon) + Wortmarke „Projektmanagement" 17px/600.
- **Mitte (per `margin-top:auto` nach unten geschoben):**
  - **Headline** 34px/600, `line-height:1.18`, `letter-spacing:-.025em`,
    max-width 430px: „Behalte jedes Projekt im Blick — von Aufgabe bis Deadline."
  - **Subtext** 15px `#8B8B93`, `line-height:1.55`, max-width 400px: „Kanban,
    Kalender, Zeiterfassung und Kennzahlen — alles an einem Ort, in einem ruhigen,
    fokussierten Workspace."
  - **Mini-Vorschaukarte** (`#0F0F12`, Border `--border`, Radius 13px, Padding 18px,
    max-width 440px) — echoes the dashboard:
    - 3 KPI-Kacheln (`#131316`, Border, Radius 9px): „Aktiv 4", „Offen 38",
      „Erledigt 68%" (letzte Zahl in `oklch(0.76 0.14 150)`). Label 9px Mono
      uppercase muted, Wert 21px/600 Geist Mono.
    - 3 Fortschrittszeilen: Projektname (120px, 11.5px `#C7C7CC`, ellipsis) +
      Balken (Höhe 6px, Track `#1A1A1E`, Radius 3px). Email-Kampagne 72 % (grün),
      Website Relaunch 45 % (blau), Onboarding Flow 88 % (violett).
- **Unten** (`margin-top:auto`): Footer „© 2026 · Alle Rechte vorbehalten"
  12px Mono `#52525B`.

---

## Formular-Panel (rechts)

- **Titel** „Willkommen zurück" 26px/600, `letter-spacing:-.02em`.
- **Untertitel** „Melde dich bei deinem Workspace an." 14px `#8B8B93`,
  `margin-top:6px`.
- **Felder** (`margin-top:32px`, vertikaler `gap:18px`):
  - **E-Mail:** Label 13px/500 `#D4D4D8` (8px Abstand). Input: Höhe 44px,
    `#101013`, Border `oklch(1 0 0 / 9%)`, Radius 10px, Padding `0 14px`; links
    Mail-Icon 16px `#71717A`; Platzhalter „du@beispiel.at" 14px `#71717A`.
  - **Passwort:** Labelzeile mit „Vergessen?" rechts (12.5px
    `oklch(0.78 0.13 280)`). Input wie oben; links Schloss-Icon, rechts
    Auge-Icon (Sichtbarkeit umschalten). **Fokus-Zustand** (im Design gezeigt):
    Border `oklch(0.66 0.19 280 / .55)` + Ring
    `box-shadow: 0 0 0 3px oklch(0.66 0.19 280 / .14)`.
  - **Primär-Button „Anmelden":** Höhe 46px, Fläche `--primary`, Radius 10px,
    weiß 14.5px/600.
  - **Trenner** „oder": 1px-Linien links/rechts (`oklch(1 0 0 / 8%)`) + Text 12px
    Mono `#52525B`.
  - **SSO-Button „Mit Google fortfahren":** Höhe 46px, `#101013`, Border,
    Radius 10px, Google-Logo + Text 14px/500 `#E4E4E7`. (Optional — nur wenn ihr
    Google-OAuth via Supabase nutzt; sonst entfernen.)
- **Footer-Zeile** (`margin-top:28px`, zentriert): „Noch kein Konto?
  **Registrieren**" — Link in `oklch(0.78 0.13 280)`/500.

---

## Zustände
- **Input-Fokus:** Border auf `oklch(0.66 0.19 280 / .55)` + 3px-Ring
  `oklch(0.66 0.19 280 / .14)`.
- **Button-Hover:** `--primary` ~6 % heller, `transition:120ms ease`.
- **Fehler** (z. B. falsche Zugangsdaten): Feld-Border
  `oklch(0.65 0.20 25)` + Hinweistext 12.5px in derselben Rot-Nuance unter dem Feld.
- **Loading:** Button zeigt Spinner + „Anmelden …", Felder disabled.
- **Registrieren** nutzt dasselbe Layout mit zusätzlichen Feldern (Name, Passwort
  bestätigen) und Titel „Konto erstellen".

## Auth-Anbindung (unverändert)
Bestehende Supabase-Auth beibehalten:
`supabase.auth.signInWithPassword({ email, password })`; Google-Button →
`signInWithOAuth({ provider: 'google' })`; „Vergessen?" →
`resetPasswordForEmail(...)`. Fehlermeldungen auf Deutsch wie bisher.

## Assets
- **Fonts:** Geist, Geist Mono (`next/font/google` — Setup in `tokens.css`).
- **Icons:** lucide-react — `Mail`, `Lock`, `Eye`/`EyeOff`. Google-Logo als
  Inline-SVG (mehrfarbig; nicht aus lucide).
- Keine Bild-Assets nötig (Showcase ist CSS/HTML).

## Dateien
- `PM Dashboard Redesign.dc.html` — HTML-Referenz. Maßgeblich: **„A · Login"**.
- `tokens.css` — Atlas-Tokens (identisch zu den anderen Paketen).
- `README.md` — dieses Dokument.

### So nutzt du es in Claude Code
1. Ordner `design_handoff_atlas_login/` ins Repo legen.
2. In Claude Code z. B.: *„Lies `design_handoff_atlas_login/README.md`. Baue die
   Login-/Startseite (`/login`) gemäß Spezifikation als Split-Screen in unsere
   bestehende Auth-Komponente um — Supabase-Auth-Logik unverändert. Tokens stecken
   schon in `globals.css`."*
