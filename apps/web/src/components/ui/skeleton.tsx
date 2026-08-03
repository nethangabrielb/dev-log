import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md opacity-50", className)}
      style={{
        backgroundColor: "var(--devlog-bg-elevated)",
      }}
      {...props}
    />
  );
}

export { Skeleton };
