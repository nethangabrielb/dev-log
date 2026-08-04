import { useEffect, useState } from "react";
import { useForm, Controller, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { SnippetCategory, SnippetLanguage } from "@devlog/types";
import type { Snippet } from "@/api/snippets.api";
import {
  snippetSchema,
  type SnippetFormValues,
} from "../schemas/snippet.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SnippetFormProps {
  snippet?: Snippet;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: SnippetFormValues) => void;
}

const LANGUAGES = Object.values(SnippetLanguage);
const CATEGORIES = Object.values(SnippetCategory);

export function SnippetForm({
  snippet,
  submitting,
  onCancel,
  onSubmit,
}: SnippetFormProps) {
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: "",
      content: "",
      description: "",
      language: SnippetLanguage.TYPESCRIPT,
      category: SnippetCategory.SNIPPET,
      tags: [],
    },
  });

  const { field: tagsField } = useController({ name: "tags", control });
  const tags = tagsField.value ?? [];

  useEffect(() => {
    if (snippet) {
      reset({
        title: snippet.title,
        content: snippet.content,
        description: snippet.description ?? "",
        language: snippet.language,
        category: snippet.category,
        tags: snippet.tags ?? [],
      });
    }
  }, [snippet, reset]);

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    tagsField.onChange([...tags, value]);
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    tagsField.onChange(tags.filter((_, i) => i !== index));
  };

  const fieldClass =
    "text-xs font-medium uppercase tracking-wider text-muted-foreground";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className={fieldClass}>Title</label>
        <Input {...register("title")} placeholder="e.g. Debounce hook" autoFocus />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={fieldClass}>Language</label>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.language && (
            <p className="text-xs text-destructive">{errors.language.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={fieldClass}>Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Description (Optional)</label>
        <Textarea
          {...register("description")}
          placeholder="What does this snippet do?"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Code</label>
        <Textarea
          {...register("content")}
          placeholder="Paste your code snippet here..."
          rows={10}
          className="font-mono"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Tags</label>
        <div className="flex items-center gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a tag..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-2">
            {tags.map((tag, index) => (
              <li
                key={`${tag}-${index}`}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-bg-elevated text-xs font-mono text-foreground"
              >
                <span className="truncate">{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="cursor-pointer rounded-sm p-0.5 text-destructive transition-colors hover:bg-muted"
                  title="Remove tag"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-accent text-accent-fg hover:bg-accent-dim"
        >
          {snippet ? "Save Changes" : "Add Snippet"}
        </Button>
      </div>
    </form>
  );
}
