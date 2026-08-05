import { z } from "zod";
import { LinkedToKind, SessionType } from "@devlog/types";

export const createSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sessionType: z.enum(SessionType),
  durationInMinutes: z
    .number({ error: "Duration is required" })
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),
  notes: z.string().optional(),
  projectId: z.string().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const sessionTodoSchema = z.object({
  name: z.string().min(1, "Todo name is required"),
  completed: z.boolean().default(false),
});

export const sessionModeSchema = z.enum(["stopwatch", "timer"]);

export const startSessionSchema = z.object({
  type: z.enum(SessionType),
  startedAt: z.date(),
  todos: z.array(sessionTodoSchema).default([]),
  linkedTo: z
    .object({
      kind: z.literal(LinkedToKind.PROJECT),
      id: z.string().min(1, "Project is required"),
    })
    .optional(),
  mode: sessionModeSchema.default("stopwatch"),
  timerMinutes: z
    .number({ error: "Duration is required" })
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration must be 8 hours or less")
    .default(30),
});

export const TIMER_PRESETS = [15, 30, 45, 60];

export type SessionTodoInput = z.infer<typeof sessionTodoSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type StartSessionFormValues = z.input<typeof startSessionSchema>;
export type SessionMode = z.infer<typeof sessionModeSchema>;
