import { useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Difficulty, DsaPattern } from "@devlog/types";
import type { DsaRecord } from "@/api/dsa.api";
import {
  useDsa,
  useCreateDsa,
  useUpdateDsa,
  useDeleteDsa,
} from "@/features/dsa/hooks/useDsa";
import { useDsaStats } from "@/features/dsa/hooks/useDsaStats";
import { DsaStatsPanel } from "@/features/dsa/components/DsaStatsPanel";
import { DsaBreakdownChart } from "@/features/dsa/components/DsaBreakdownChart";
import { DsaProblemList } from "@/features/dsa/components/DsaProblemList";
import { DsaProblemSheet } from "@/features/dsa/components/DsaProblemSheet";
import { DsaProblemDialog } from "@/features/dsa/components/DsaProblemDialog";
import {
  DIFFICULTY_ORDER,
  difficultyColor,
  patternColor,
} from "@/features/dsa/components/dsaColors";
import type { DsaProblemFormValues } from "@/features/dsa/schemas/dsa.schema";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getApiErrorMessage } from "@/lib/apiError";

export function DSAPage() {
  const { data: rawProblems, isLoading, isError, error } = useDsa();
  const { data: stats, isLoading: isStatsLoading } = useDsaStats();
  const { mutate: createProblem, isPending: isCreatePending } = useCreateDsa();
  const { mutate: updateProblem, isPending: isUpdatePending } = useUpdateDsa();
  const { mutate: deleteProblem } = useDeleteDsa();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editing, setEditing] = useState<DsaRecord | null>(null);

  const problems = useMemo<DsaRecord[]>(() => {
    if (Array.isArray(rawProblems)) return rawProblems;
    return [];
  }, [rawProblems]);

  const difficultyData = useMemo(
    () =>
      DIFFICULTY_ORDER.map((difficulty) => {
        const found = stats?.breakdownByDifficulty?.find(
          (b) => b.difficulty === difficulty
        );
        return { name: difficulty, count: found?.count ?? 0 };
      }),
    [stats]
  );

  const patternData = useMemo(
    () =>
      (stats?.breakdownByPattern ?? []).map((b) => ({
        name: b.pattern,
        count: b.count,
      })),
    [stats]
  );

  const handleCreate = (values: DsaProblemFormValues) => {
    createProblem(
      {
        ...values,
        isSolved: false,
        solvedAt: new Date().toISOString(),
      },
      { onSuccess: () => setIsSheetOpen(false) }
    );
  };

  const handleUpdate = (values: DsaProblemFormValues) => {
    if (!editing) return;
    const id = editing._id || editing.id || "";
    if (!id) return;
    updateProblem({ id, dto: values }, { onSuccess: () => setEditing(null) });
  };

  const handleToggleSolved = (problem: DsaRecord) => {
    const id = problem._id || problem.id || "";
    if (!id) return;
    updateProblem({
      id,
      dto: problem.isSolved
        ? { isSolved: false }
        : { isSolved: true, solvedAt: new Date().toISOString() },
    });
  };

  const handleDelete = (problem: DsaRecord) => {
    const id = problem._id || problem.id || "";
    if (!id) return;
    if (confirm("Are you sure you want to delete this problem?")) {
      deleteProblem(id);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DSA Tracker</h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Track solved problems and review your pattern mastery
            </p>
          </div>
          <Button
            onClick={() => setIsSheetOpen(true)}
            className="gap-2 bg-accent text-accent-fg hover:bg-accent-dim"
          >
            <Plus className="h-4 w-4" />
            <span>Add Problem</span>
          </Button>
        </div>

        {isError && (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 my-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {getApiErrorMessage(
                error,
                "Failed to load DSA problems. Make sure the backend server is running."
              )}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <DsaStatsPanel stats={stats} loading={isStatsLoading} />
          <div className="lg:col-span-2">
            <DsaProblemList
              problems={problems}
              loading={isLoading}
              onToggleSolved={handleToggleSolved}
              onEdit={setEditing}
              onDelete={handleDelete}
              onAdd={() => setIsSheetOpen(true)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DsaBreakdownChart
            title="By Difficulty"
            subtitle="Problems tracked per difficulty level"
            data={difficultyData}
            colorFor={(name) => difficultyColor(name as Difficulty)}
            loading={isStatsLoading}
            labelWidth={90}
          />
          <DsaBreakdownChart
            title="By Pattern"
            subtitle="Problems tracked per DSA pattern"
            data={patternData}
            colorFor={(name) => patternColor(name as DsaPattern)}
            loading={isStatsLoading}
          />
        </div>

        <DsaProblemSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          submitting={isCreatePending}
          onSubmit={handleCreate}
        />
        <DsaProblemDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          problem={editing ?? undefined}
          submitting={isUpdatePending}
          onSubmit={handleUpdate}
        />
      </div>
    </ErrorBoundary>
  );
}

export default DSAPage;
