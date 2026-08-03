import { z } from "zod";
import { SessionType } from "@devlog/types";

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
