"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Lädt Projekte (optional auf einen Workspace gefiltert).
// RLS sorgt dafür, dass nur erlaubte Projekte zurückkommen.
export function useProjects(workspaceId) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (workspaceId) query = query.eq("workspace_id", workspaceId);

    const { data } = await query;
    setProjects(data || []);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projects, loading, refresh };
}
