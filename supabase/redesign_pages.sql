-- =====================================================================
--  Atlas – Weitere Seiten: Schema-Ergänzungen
--  Einmalig im Supabase SQL Editor ausführen. Idempotent.
-- =====================================================================

-- 1) ZEITERFASSUNG: Abrechenbar-Flag ------------------------------------
alter table time_entries
  add column if not exists billable boolean not null default true;

-- 2) BENACHRICHTIGUNGEN: Tabelle ----------------------------------------
create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade, -- Empfänger
  workspace_id uuid references workspaces(id) on delete cascade,
  project_id   uuid references projects(id) on delete set null,
  task_id      uuid references tasks(id) on delete set null,
  actor_id     uuid references auth.users(id) on delete set null,        -- Auslöser
  type         text not null default 'info',  -- assignment | status_change | deadline | mention | info
  title        text not null,                 -- betroffenes Objekt (z. B. Task-Titel)
  status       text,                          -- bei status_change der neue Status
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on notifications (user_id, created_at desc);

alter table notifications enable row level security;

-- Nur eigene Benachrichtigungen lesen/ändern/löschen
drop policy if exists "app_select_notifications" on notifications;
create policy "app_select_notifications" on notifications
  for select using ( user_id = auth.uid() );

drop policy if exists "app_update_notifications" on notifications;
create policy "app_update_notifications" on notifications
  for update using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );

drop policy if exists "app_delete_notifications" on notifications;
create policy "app_delete_notifications" on notifications
  for delete using ( user_id = auth.uid() );

-- Einfügen: für sich selbst ODER als Mitglied des betroffenen Workspaces
drop policy if exists "app_insert_notifications" on notifications;
create policy "app_insert_notifications" on notifications
  for insert with check (
    user_id = auth.uid()
    or (workspace_id is not null and is_workspace_member(workspace_id))
  );
