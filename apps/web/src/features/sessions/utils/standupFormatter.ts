import { SessionType, type SessionTodo } from "@devlog/types";
import { formatDuration } from "@/lib/formatters";

/**
 * Shape of a session record returned by GET /sessions (and consumed by SessionCard / useSessions).
 */
export interface StandupSessionItem {
  _id?: string;
  id?: string;
  type: SessionType;
  durationInSeconds?: number;
  startedAt?: string | Date;
  endedAt?: string | Date;
  todos?: SessionTodo[];
  linkedTo?: {
    kind?: string;
    id?: string;
    name?: string;
  };
  projectName?: string;
}

export interface FormatStandupOptions {
  dateHeader?: string;
  includeTotalTime?: boolean;
}

/**
 * Pure function that formats a list of session records into a Markdown standup summary.
 *
 * Output format:
 * - **[<Type>]** <Project Name if linked> (<Duration>)
 *   - [x] Completed task
 *   - [ ] Incomplete task
 */
export function formatStandupSummary(
  sessions: StandupSessionItem[],
  options: FormatStandupOptions = {}
): string {
  if (!sessions || sessions.length === 0) {
    return "_No sessions recorded._";
  }

  const lines: string[] = [];

  if (options.dateHeader) {
    lines.push(`### Daily Standup — ${options.dateHeader}`);
  }

  if (options.includeTotalTime) {
    const totalSeconds = sessions.reduce(
      (sum, s) => sum + (s.durationInSeconds || 0),
      0
    );
    if (totalSeconds > 0) {
      lines.push(
        `**Total Focus Time**: ${formatDuration(totalSeconds)} (${sessions.length} session${sessions.length === 1 ? "" : "s"})\n`
      );
    }
  }

  for (const session of sessions) {
    const projectName = session.linkedTo?.name || session.projectName;
    const titlePart = projectName
      ? `**[${session.type}]** ${projectName}`
      : `**[${session.type}]**`;
    const durationPart =
      typeof session.durationInSeconds === "number" &&
      session.durationInSeconds > 0
        ? ` (${formatDuration(session.durationInSeconds)})`
        : "";

    lines.push(`- ${titlePart}${durationPart}`);

    if (session.todos && session.todos.length > 0) {
      for (const todo of session.todos) {
        const mark = todo.completed ? "[x]" : "[ ]";
        lines.push(`  - ${mark} ${todo.name}`);
      }
    }
  }

  return lines.join("\n");
}
