import { z } from "zod";
import { ArticleCategory, ArticleStatus } from "@devlog/types";

export const articleSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Enter a valid URL"),
  title: z.string().trim().min(1, "Title is required"),
  category: z.nativeEnum(ArticleCategory),
  status: z.nativeEnum(ArticleStatus),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
