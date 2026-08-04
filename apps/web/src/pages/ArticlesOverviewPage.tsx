import { format } from "date-fns";
import {
  BookOpen,
  BookMarked,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ArticleCategory } from "@devlog/types";
import { useArticleStats } from "@/features/articles/hooks/useArticles";
import { articleCategoryColor } from "@/features/articles/components/articleColors";
import { StatCard } from "@/components/common/StatCard";
import { BreakdownChart } from "@/components/common/BreakdownChart";
import { TrendAreaChart } from "@/components/common/TrendAreaChart";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/formatters";

export function ArticlesOverviewPage() {
  const { data: stats, isLoading } = useArticleStats();

  const readRatio = stats?.readRatio;
  const total = readRatio?.total ?? 0;
  const read = readRatio?.read ?? 0;
  const readThisMonth = (stats?.readThisMonth ?? []).reduce(
    (sum, day) => sum + day.count,
    0
  );

  const categoryData = Object.values(ArticleCategory).map((category) => {
    const found = (stats?.breakdownByCategory ?? []).find(
      (b) => b.category === category
    );
    return { name: category, count: found?.count ?? 0 };
  });

  const readData = (stats?.readThisMonth ?? []).map((d) => ({
    x: d.date,
    y: d.count,
  }));

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Articles Overview</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Aggregate statistics across your reading list
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
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
              label="Total Articles"
              value={total}
              sublabel="Articles saved to your list"
              icon={BookOpen}
            />
            <StatCard
              label="Read"
              value={`${read} / ${total}`}
              sublabel={total === 0 ? "No articles yet" : `${read} of ${total} read`}
              icon={CheckCircle2}
            />
            <StatCard
              label="Read This Month"
              value={String(readThisMonth)}
              sublabel={readThisMonth === 1 ? "Article finished" : "Articles finished"}
              icon={BookMarked}
            />
            <StatCard
              label="Time Reading"
              value={formatDuration(stats?.totalTimeSpentReading?.totalDuration ?? 0)}
              sublabel="Total article session time"
              icon={Clock}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownChart
          title="Articles by Category"
          subtitle="Distribution of saved articles across categories"
          data={categoryData}
          colorFor={(name) => articleCategoryColor(name as ArticleCategory)}
          loading={isLoading}
          labelWidth={90}
          countNoun="article"
          emptyTitle="No articles yet"
          emptyDescription="Save an article to see the category breakdown here."
        />
        <TrendAreaChart
          title="Articles Read — This Month"
          subtitle="Number of articles finished per day this month"
          data={readData}
          loading={isLoading}
          gradientId="articlesReadGradient"
          valueFormatter={(count) => `${count} article${count === 1 ? "" : "s"}`}
          xFormatter={(raw) => format(new Date(raw), "MMM d")}
          emptyTitle="No articles read yet"
          emptyDescription="Finish an article this month to see the trend here."
        />
      </div>
    </div>
  );
}

export default ArticlesOverviewPage;
