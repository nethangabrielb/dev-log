import { useMemo, useState } from "react";
import { Code2, Plus } from "lucide-react";
import type { DsaRecord } from "@/api/dsa.api";
import { Difficulty } from "@devlog/types";
import { DsaProblemCard } from "./DsaProblemCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_ORDER, difficultyColor } from "./dsaColors";

export type DifficultyFilter = Difficulty | "All";

export interface DsaProblemListProps {
  problems: DsaRecord[];
  loading: boolean;
  onToggleSolved: (problem: DsaRecord) => void;
  onEdit: (problem: DsaRecord) => void;
  onDelete: (problem: DsaRecord) => void;
  onAdd: () => void;
}

const FILTER_OPTIONS: DifficultyFilter[] = [
  "All",
  ...DIFFICULTY_ORDER,
];

export function DsaProblemList({
  problems,
  loading,
  onToggleSolved,
  onEdit,
  onDelete,
  onAdd,
}: DsaProblemListProps) {
  const [filter, setFilter] = useState<DifficultyFilter>("All");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? problems
        : problems.filter((p) => p.difficulty === filter),
    [problems, filter]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isSelected = filter === option;
          const color =
            option === "All"
              ? "var(--devlog-accent)"
              : difficultyColor(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className="px-2.5 py-1 text-xs font-mono rounded-md border font-medium transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: isSelected
                  ? color
                  : "var(--devlog-bg-elevated)",
                color: isSelected
                  ? "var(--devlog-accent-fg)"
                  : "var(--devlog-text-primary)",
                borderColor: isSelected ? color : "var(--devlog-border)",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 border border-border rounded-lg flex items-center gap-3 bg-bg-surface"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        ))
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Code2}
          title={
            problems.length === 0
              ? "No problems tracked"
              : "No problems match this difficulty"
          }
          description={
            problems.length === 0
              ? "Add your first DSA problem to start building streaks."
              : "Try a different difficulty filter."
          }
          action={
            <Button
              onClick={onAdd}
              className="gap-1.5 bg-accent text-accent-fg hover:bg-accent-dim"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Problem</span>
            </Button>
          }
        />
      ) : (
        filtered.map((problem) => (
          <DsaProblemCard
            key={problem._id || problem.id}
            problem={problem}
            onToggleSolved={onToggleSolved}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
