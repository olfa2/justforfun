"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Lädt Tasks eines Projekts. `refresh` zum erneuten Laden nach Mutationen.
export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    setTasks(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!projectId) {
        await Promise.resolve();
        if (!ignore) {
          setTasks([]);
          setLoading(false);
        }
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (!ignore) {
        setTasks(data || []);
        setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [projectId]);

  return { tasks, loading, refresh, setTasks };
}
