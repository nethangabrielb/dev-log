import { z } from "zod";
import { ProjectCategory, ProjectStatus } from "@devlog/types";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  category: z.nativeEnum(ProjectCategory),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
