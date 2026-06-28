"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  getMeta,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const STATUS_ORDER = TASK_STATUSES.map((s) => s.value);

export function ListView({ tasks, onRowClick, currentUser }) {
  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        Noch keine Aufgaben.
      </div>
    );
  }

  const sorted = [...tasks].sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(a.status);
    const sb = STATUS_ORDER.indexOf(b.status);
    if (sa !== sb) return sa - sb;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-card text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium">Aufgabe</th>
            <th className="px-4 py-2.5 text-left font-medium">Status</th>
            <th className="px-4 py-2.5 text-left font-medium">Priorität</th>
            <th className="px-4 py-2.5 text-left font-medium">Fällig</th>
            <th className="px-4 py-2.5 text-right font-medium">Zugewiesen</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => {
            const status = getMeta(TASK_STATUSES, task.status);
            const priority = getMeta(TASK_PRIORITIES, task.priority);
            const assignedToMe =
              task.assignee_id && task.assignee_id === currentUser?.id;
            return (
              <tr
                key={task.id}
                onClick={() => onRowClick?.(task)}
                className="cursor-pointer border-t border-border transition-colors hover:bg-card-hover"
              >
                <td className="px-4 py-2.5 font-medium">{task.title}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={status.badge}>{status.label}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant={priority.badge}>{priority.label}</Badge>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {task.due_date ? formatDate(task.due_date) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end">
                    {task.assignee_id ? (
                      <Avatar
                        name={assignedToMe ? currentUser?.name : "?"}
                        size="sm"
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
