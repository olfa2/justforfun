# Projektmanagement Dashboard

Linear-inspiriertes Project-Management-Dashboard – HTL Jahresprojekt (Betriebsinformatik).

## Tech Stack

- **Next.js 16** (App Router, JavaScript)
- **Supabase** (PostgreSQL, Auth, Row Level Security)
- **Tailwind CSS v4** (Dark/Light Mode via `next-themes`)
- **@dnd-kit** (Drag & Drop für das Kanban-Board)
- **lucide-react** (Icons), **react-markdown** (Notes)

## Setup

1. **Abhängigkeiten installieren**

   ```bash
   npm install
   ```

2. **Supabase-Keys eintragen**

   Werte aus dem Supabase-Dashboard unter **Project Settings → API** kopieren
   und in `.env.local` eintragen:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-public-key
   ```

   > Ohne diese Werte leitet die App zum Login weiter, ein Anmelden ist aber
   > erst nach dem Eintragen möglich.

3. **Dev-Server starten**

   ```bash
   npm run dev
   ```

   App läuft auf [http://localhost:3000](http://localhost:3000).

4. **Erstes Konto anlegen** – auf der Login-Seite über „Registrieren“.
   Falls in Supabase die E-Mail-Bestätigung aktiv ist: Bestätigungslink in der
   Mail klicken (oder unter **Authentication → Providers → Email** in Supabase
   „Confirm email“ deaktivieren, um beim Entwickeln schneller zu sein).

## Projektstruktur

```
src/
├── app/
│   ├── (auth)/login/         Login & Registrierung
│   └── (dashboard)/          geschützter Bereich (Sidebar-Layout)
│       ├── dashboard/        Startseite nach Login
│       ├── projects/         Projektübersicht
│       ├── calendar/         Kalender (in Arbeit)
│       ├── time-tracking/    Zeiterfassung (in Arbeit)
│       ├── notifications/    Benachrichtigungen (in Arbeit)
│       └── settings/         Profil & Theme
├── components/               UI-, Layout- & Feature-Komponenten
├── hooks/                    useUser, useProjects, useTasks
├── lib/
│   ├── supabase/             Browser- & Server-Client, Session-Proxy
│   ├── constants.js          Status/Prioritäten/Rollen (deutsche Labels)
│   └── utils.js              Helfer (cn, Datum, Initialen …)
└── proxy.js                  Session-Refresh & Routen-Schutz (ehem. middleware)
```

## Scripts

| Befehl          | Beschreibung                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Entwicklungsserver               |
| `npm run build` | Produktions-Build                |
| `npm run start` | Produktionsserver (nach Build)   |
| `npm run lint`  | ESLint                           |
