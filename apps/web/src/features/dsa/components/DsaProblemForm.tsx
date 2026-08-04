import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfidenceLevel, Difficulty, DsaPattern } from "@devlog/types";
import type { DsaRecord } from "@/api/dsa.api";
import { dsaProblemSchema, type DsaProblemFormValues } from "../schemas/dsa.schema";
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

export interface DsaProblemFormProps {
  problem?: DsaRecord;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: DsaProblemFormValues) => void;
}

const DIFFICULTIES = Object.values(Difficulty);
const PATTERNS = Object.values(DsaPattern);
const CONFIDENCE_LEVELS = Object.values(ConfidenceLevel);

export function DsaProblemForm({
  problem,
  submitting,
  onCancel,
  onSubmit,
}: DsaProblemFormProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof dsaProblemSchema>, unknown, DsaProblemFormValues>({
    resolver: zodResolver(dsaProblemSchema),
    defaultValues: {
      problemName: "",
      problemNumber: undefined,
      difficulty: Difficulty.EASY,
      pattern: DsaPattern.TWO_POINTERS,
      confidenceLevel: ConfidenceLevel.MEDIUM,
      notes: "",
    },
  });

  useEffect(() => {
    if (problem) {
      reset({
        problemName: problem.problemName,
        problemNumber: problem.problemNumber,
        difficulty: problem.difficulty,
        pattern: problem.pattern,
        confidenceLevel: problem.confidenceLevel,
        notes: problem.notes ?? "",
      });
    }
  }, [problem, reset]);

  const fieldClass = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className={fieldClass}>Problem Name</label>
        <Input
          {...register("problemName")}
          placeholder="e.g. Two Sum"
          autoFocus
        />
        {errors.problemName && (
          <p className="text-xs text-destructive">{errors.problemName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Problem Number</label>
        <Input
          {...register("problemNumber")}
          type="number"
          placeholder="e.g. 1"
        />
        {errors.problemNumber && (
          <p className="text-xs text-destructive">{errors.problemNumber.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Difficulty</label>
        <Controller
          name="difficulty"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.difficulty && (
          <p className="text-xs text-destructive">{errors.difficulty.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Pattern</label>
        <Controller
          name="pattern"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                {PATTERNS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.pattern && (
          <p className="text-xs text-destructive">{errors.pattern.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Confidence Level</label>
        <Controller
          name="confidenceLevel"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select confidence" />
              </SelectTrigger>
              <SelectContent>
                {CONFIDENCE_LEVELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.confidenceLevel && (
          <p className="text-xs text-destructive">{errors.confidenceLevel.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className={fieldClass}>Notes (Optional)</label>
        <Textarea {...register("notes")} placeholder="Approach, edge cases, follow-ups..." />
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
          {problem ? "Save Changes" : "Add Problem"}
        </Button>
      </div>
    </form>
  );
}
