import { z } from "zod";
import { SnippetCategory, SnippetLanguage } from "@devlog/types";

export const snippetSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Code content is required"),
  description: z.string().optional(),
  language: z.nativeEnum(SnippetLanguage),
  category: z.nativeEnum(SnippetCategory),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export type SnippetFormValues = z.infer<typeof snippetSchema>;
