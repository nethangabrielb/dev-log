import { Flame, Trophy, CheckCircle2 } from "lucide-react";
import type { DsaStatistics } from "@devlog/types";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface DsaStatsPanelProps {
  stats?: DsaStatistics;
  loading: boolean;
}

export function DsaStatsPanel({ stats, loading }: DsaStatsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatCard
        label="Current Streak"
        value={`${stats?.currentStreak ?? 0} days`}
        sublabel="Consecutive days with a solved problem"
        icon={Flame}
      />
      <StatCard
        label="Longest Streak"
        value={`${stats?.longestStreak ?? 0} days`}
        sublabel="Best solving streak recorded"
        icon={Trophy}
      />
      <StatCard
        label="Problems Solved"
        value={stats?.totalProblemsSolved ?? 0}
        sublabel="Problems marked as solved"
        icon={CheckCircle2}
      />
    </div>
  );
}
