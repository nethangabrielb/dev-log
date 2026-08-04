import { useEffect, useState } from "react";
import { useForm, Controller, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { ProjectCategory, ProjectStatus } from "@devlog/types";
import type { Project } from "@/api/projects.api";
import {
  projectSchema,
  type ProjectFormValues,
} from "../schemas/project.schema";
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

export interface ProjectFormProps {
  project?: Project;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ProjectFormValues) => void;
}

const CATEGORIES = Object.values(ProjectCategory);
const STATUSES = Object.values(ProjectStatus);

export function ProjectForm({
  project,
  submitting,
  onCancel,
  onSubmit,
}: ProjectFormProps) {
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      category: ProjectCategory.PERSONAL,
      description: "",
      status: ProjectStatus.ACTIVE,
      tags: [],
    },
  });

  const { field: tagsField } = useController({ name: "tags", control });
  const tags = tagsField.value ?? [];

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        category: project.category,
        description: project.description ?? "",
        status: project.status ?? ProjectStatus.ACTIVE,
        tags: project.tags ?? [],
      });
    }
  }, [project, reset]);

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
        <label className={fieldClass}>Name</label>
        <Input {...register("name")} placeholder="e.g. Portfolio Website" autoFocus />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
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
        <label className={fieldClass}>Description (Optional)</label>
        <Textarea
          {...register("description")}
          placeholder="What is this project about?"
        />
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
          {project ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
