import { format } from "date-fns";
import { CheckCircle2, Flame, Target, Trophy } from "lucide-react";
import { Difficulty, DsaPattern } from "@devlog/types";
import { useDsa } from "@/features/dsa/hooks/useDsa";
import { useDsaStats } from "@/features/dsa/hooks/useDsaStats";
import { DsaBreakdownChart } from "@/features/dsa/components/DsaBreakdownChart";
import {
  difficultyColor,
  patternColor,
  DIFFICULTY_ORDER,
} from "@/features/dsa/components/dsaColors";
import { StatCard } from "@/components/common/StatCard";
import { TrendAreaChart } from "@/components/common/TrendAreaChart";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DsaOverviewPage() {
  const { data: stats, isLoading: isStatsLoading } = useDsaStats();
  const { data: rawProblems, isLoading: isProblemsLoading } = useDsa();

  const loading = isStatsLoading || isProblemsLoading;
  const tracked = rawProblems?.total ?? 0;

  const difficultyData = DIFFICULTY_ORDER.map((difficulty) => {
    const found = (stats?.breakdownByDifficulty ?? []).find(
      (b) => b.difficulty === difficulty
    );
    return { name: difficulty, count: found?.count ?? 0 };
  });

  const patternData = (stats?.breakdownByPattern ?? []).map((b) => ({
    name: b.pattern,
    count: b.count,
  }));

  const solvedData = (stats?.problemsSolvedOverTime ?? []).map((d) => ({
    x: d.date,
    y: d.count,
  }));

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DSA Overview</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Aggregate statistics across your solved problems
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              label="Problems Solved"
              value={stats?.totalProblemsSolved ?? 0}
              sublabel="Problems marked as solved"
              icon={CheckCircle2}
            />
            <StatCard
              label="Problems Tracked"
              value={tracked}
              sublabel="Total problems in your tracker"
              icon={Target}
            />
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
          </>
        )}
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

      <TrendAreaChart
        title="Problems Solved — Last 14 Days"
        subtitle="Number of problems solved per day over the past two weeks"
        data={solvedData}
        loading={isStatsLoading}
        gradientId="dsaSolvedGradient"
        valueFormatter={(count) => `${count} problem${count === 1 ? "" : "s"}`}
        xFormatter={(raw) => format(new Date(raw), "MMM d")}
        emptyTitle="No problems solved yet"
        emptyDescription="Solve a DSA problem to see activity here."
      />
    </div>
  );
}

export default DsaOverviewPage;
