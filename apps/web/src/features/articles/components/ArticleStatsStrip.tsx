import { BookMarked, CheckCircle2, Clock } from "lucide-react";
import type { ArticlesStatistics } from "@devlog/types";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/formatters";

export interface ArticleStatsStripProps {
  stats?: ArticlesStatistics;
  loading: boolean;
}

export function ArticleStatsStrip({ stats, loading }: ArticleStatsStripProps) {
  const readRatio = stats?.readRatio;
  const totalRead = readRatio?.read ?? 0;
  const total = readRatio?.total ?? 0;
  const readThisMonth = (stats?.readThisMonth ?? []).reduce(
    (sum, day) => sum + day.count,
    0
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Time Reading"
        value={formatDuration(stats?.totalTimeSpentReading?.totalDuration ?? 0)}
        sublabel="Total article session time"
        icon={Clock}
      />
      <StatCard
        label="Read Ratio"
        value={`${totalRead} / ${total}`}
        sublabel={total === 0 ? "No articles yet" : `${totalRead} of ${total} read`}
        icon={CheckCircle2}
      />
      <StatCard
        label="Read This Month"
        value={String(readThisMonth)}
        sublabel={readThisMonth === 1 ? "Article finished" : "Articles finished"}
        icon={BookMarked}
      />
    </div>
  );
}
