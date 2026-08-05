import { Timer, Code2, BookOpen, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Timer,
    title: "Sessions timer",
    description:
      "Start and stop a timer to log focused work, categorized by type and project.",
  },
  {
    icon: Code2,
    title: "DSA tracker",
    description:
      "Log problems you solve and track patterns, difficulty, and your streak.",
  },
  {
    icon: BookOpen,
    title: "Article tracker",
    description:
      "Keep a reading list and track time spent so your backlog stops hiding.",
  },
  {
    icon: ClipboardList,
    title: "Daily Reports",
    description:
      "Auto-generated nightly summaries of where your time went, by type.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-24">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Everything you work on, in one log
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Four tools that keep your developer life accounted for.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="border border-border bg-bg-surface text-text-primary"
          >
            <CardContent className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-elevated">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-text-primary">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
