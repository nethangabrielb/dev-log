import { useEffect, useState } from "react";
import { useForm, Controller, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { ArticleCategory, ArticleStatus } from "@devlog/types";
import type { Article } from "@/api/articles.api";
import {
  articleSchema,
  type ArticleFormValues,
} from "../schemas/article.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ArticleFormProps {
  article?: Article;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ArticleFormValues) => void;
}

const CATEGORIES = Object.values(ArticleCategory);
const STATUSES = Object.values(ArticleStatus);

export function ArticleForm({
  article,
  submitting,
  onCancel,
  onSubmit,
}: ArticleFormProps) {
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      url: "",
      title: "",
      category: ArticleCategory.FRONTEND,
      status: ArticleStatus.UNREAD,
      tags: [],
    },
  });

  const { field: tagsField } = useController({ name: "tags", control });
  const tags = tagsField.value ?? [];

  useEffect(() => {
    if (article) {
      reset({
        url: article.url,
        title: article.title,
        category: article.category,
        status: article.status ?? ArticleStatus.UNREAD,
        tags: article.tags ?? [],
      });
    }
  }, [article, reset]);

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
        <label className={fieldClass}>URL</label>
        <Input
          {...register("url")}
          placeholder="https://example.com/article"
          autoFocus
        />
        {errors.url && (
          <p className="text-xs text-destructive">{errors.url.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Title</label>
        <Input {...register("title")} placeholder="e.g. Understanding React Query" />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
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

      <div className="space-y-1.5">
        <label className={fieldClass}>Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-xs text-destructive">{errors.status.message}</p>
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
          {article ? "Save Changes" : "Add Article"}
        </Button>
      </div>
    </form>
  );
}
