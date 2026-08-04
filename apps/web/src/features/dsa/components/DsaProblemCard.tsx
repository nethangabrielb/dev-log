import { CheckCircle2, Circle, Edit3, NotebookPen, Trash2 } from "lucide-react";
import type { DsaRecord } from "@/api/dsa.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { difficultyColor, patternColor } from "./dsaColors";

export interface DsaProblemCardProps {
  problem: DsaRecord;
  onToggleSolved: (problem: DsaRecord) => void;
  onEdit: (problem: DsaRecord) => void;
  onDelete: (problem: DsaRecord) => void;
}

export function DsaProblemCard({
  problem,
  onToggleSolved,
  onEdit,
  onDelete,
}: DsaProblemCardProps) {
  const difficulty = difficultyColor(problem.difficulty);
  const pattern = patternColor(problem.pattern);

  return (
    <Card className="group transition-all">
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onToggleSolved(problem)}
              className="shrink-0 cursor-pointer rounded-sm transition-colors hover:opacity-80"
              title={problem.isSolved ? "Mark as unsolved" : "Mark as solved"}
              aria-label={problem.isSolved ? "Mark as unsolved" : "Mark as solved"}
            >
              {problem.isSolved ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <span
              className="px-1.5 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
              style={{
                color: difficulty,
                borderColor: difficulty,
                backgroundColor: "var(--devlog-bg-elevated)",
              }}
            >
              #{problem.problemNumber}
            </span>
            <div className="min-w-0">
              <p
                className="text-sm font-medium truncate text-foreground"
                style={{ opacity: problem.isSolved ? 0.6 : 1 }}
              >
                {problem.problemName}
              </p>
              <p className="text-xs font-mono truncate" style={{ color: pattern }}>
                {problem.pattern}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="px-2 py-0.5 text-xs font-mono font-medium rounded border shrink-0"
              style={{
                color: difficulty,
                borderColor: difficulty,
                backgroundColor: "var(--devlog-bg-elevated)",
              }}
            >
              {problem.difficulty}
            </span>
            <span className="hidden sm:inline text-xs font-mono text-muted-foreground">
              {problem.confidenceLevel}
            </span>
            {problem.notes && (
              <NotebookPen
                className="hidden sm:block h-3.5 w-3.5 text-muted-foreground"
                aria-label="Has notes"
              />
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(problem)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit problem"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(problem)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-danger"
              title="Delete problem"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
