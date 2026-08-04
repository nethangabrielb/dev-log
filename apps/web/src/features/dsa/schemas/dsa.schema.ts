import { z } from "zod";
import { ConfidenceLevel, Difficulty, DsaPattern } from "@devlog/types";

export const dsaProblemSchema = z.object({
  problemName: z
    .string()
    .trim()
    .min(1, "Problem name is required"),
  problemNumber: z.coerce
    .number()
    .positive("Problem number must be a positive integer")
    .int("Problem number must be a whole number"),
  difficulty: z.nativeEnum(Difficulty),
  pattern: z.nativeEnum(DsaPattern),
  confidenceLevel: z.nativeEnum(ConfidenceLevel),
  notes: z.string().optional(),
});

export type DsaProblemFormValues = z.infer<typeof dsaProblemSchema>;
