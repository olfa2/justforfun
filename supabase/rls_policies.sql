-- =====================================================================
--  RLS-Policies für das Projektmanagement-Dashboard
--  Einmalig im Supabase SQL Editor ausführen (Database -> SQL Editor).
--  Idempotent: kann gefahrlos mehrfach ausgeführt werden.
--
--  Nutzt die vorhandenen Hilfsfunktionen:
--    is_workspace_member(ws_id)   -> ist der aktuelle User Mitglied?
--    project_workspace(p_id)      -> Workspace-ID zu einem Projekt
-- =====================================================================

-- Sicherstellen, dass RLS aktiv ist
alter table workspaces        enable row level security;
alter table workspace_members enable row level security;
alter table projects          enable row level security;
alter table milestones        enable row level security;
alter table tasks             enable row level security;
alter table notes             enable row level security;
alter table time_entries      enable row level security;
alter table events            enable row level security;

-- ---------------------------------------------------------------------
--  WORKSPACES
-- ---------------------------------------------------------------------
drop policy if exists "app_select_workspaces" on workspaces;
create policy "app_select_workspaces" on workspaces
  for select using ( owner_id = auth.uid() or is_workspace_member(id) );

drop policy if exists "app_insert_workspaces" on workspaces;
create policy "app_insert_workspaces" on workspaces
  for insert with check ( owner_id = auth.uid() );

drop policy if exists "app_update_workspaces" on workspaces;
create policy "app_update_workspaces" on workspaces
  for update using ( owner_id = auth.uid() )
  with check ( owner_id = auth.uid() );

drop policy if exists "app_delete_workspaces" on workspaces;
create policy "app_delete_workspaces" on workspaces
  for delete using ( owner_id = auth.uid() );

-- ---------------------------------------------------------------------
--  WORKSPACE_MEMBERS
--  (user_id = auth.uid() erlaubt das Selbst-Eintragen als Owner)
-- ---------------------------------------------------------------------
drop policy if exists "app_select_members" on workspace_members;
create policy "app_select_members" on workspace_members
  for select using ( user_id = auth.uid() or is_workspace_member(workspace_id) );

drop policy if exists "app_insert_members" on workspace_members;
create policy "app_insert_members" on workspace_members
  for insert with check ( user_id = auth.uid() or is_workspace_member(workspace_id) );

drop policy if exists "app_delete_members" on workspace_members;
create policy "app_delete_members" on workspace_members
  for delete using ( user_id = auth.uid() or is_workspace_member(workspace_id) );

-- ---------------------------------------------------------------------
--  PROJECTS
-- ---------------------------------------------------------------------
drop policy if exists "app_all_projects" on projects;
create policy "app_all_projects" on projects
  for all using ( is_workspace_member(workspace_id) )
  with check ( is_workspace_member(workspace_id) );

-- ---------------------------------------------------------------------
--  MILESTONES / TASKS / NOTES / TIME_ENTRIES  (über project -> workspace)
-- ---------------------------------------------------------------------
drop policy if exists "app_all_milestones" on milestones;
create policy "app_all_milestones" on milestones
  for all using ( is_workspace_member(project_workspace(project_id)) )
  with check ( is_workspace_member(project_workspace(project_id)) );

drop policy if exists "app_all_tasks" on tasks;
create policy "app_all_tasks" on tasks
  for all using ( is_workspace_member(project_workspace(project_id)) )
  with check ( is_workspace_member(project_workspace(project_id)) );

drop policy if exists "app_all_notes" on notes;
create policy "app_all_notes" on notes
  for all using ( is_workspace_member(project_workspace(project_id)) )
  with check ( is_workspace_member(project_workspace(project_id)) );

drop policy if exists "app_all_time_entries" on time_entries;
create policy "app_all_time_entries" on time_entries
  for all using ( is_workspace_member(project_workspace(project_id)) )
  with check ( is_workspace_member(project_workspace(project_id)) );

-- ---------------------------------------------------------------------
--  EVENTS  (direkt am Workspace)
-- ---------------------------------------------------------------------
drop policy if exists "app_all_events" on events;
create policy "app_all_events" on events
  for all using ( is_workspace_member(workspace_id) )
  with check ( is_workspace_member(workspace_id) );
