-- =====================================================================
--  Doppelte updated_at-Trigger & redundante Funktion bereinigen
--  + fehlenden search_path bei project_workspace() fixieren.
--  Nicht automatisch ausgeführt – manuell über SQL-Konsole / CLI einspielen.
-- =====================================================================

begin;

-- 1) Doppelte updated_at-Trigger entfernen.
--    Die einheitlichen set_*-Trigger bleiben (auch auf profiles vorhanden),
--    die zusätzlichen trg_*-Trigger fallen weg.
drop trigger if exists trg_notes_updated_at    on public.notes;
drop trigger if exists trg_projects_updated_at on public.projects;
drop trigger if exists trg_tasks_updated_at    on public.tasks;

-- 2) Redundante Trigger-Funktion entfernen (erst NACH den Triggern).
drop function if exists public.update_updated_at();

-- 3) Fehlenden search_path bei der SECURITY-DEFINER-Funktion setzen.
alter function public.project_workspace(uuid) set search_path = public;

commit;
