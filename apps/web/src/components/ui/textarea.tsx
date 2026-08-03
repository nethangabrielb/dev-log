import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-[var(--devlog-accent)] focus-visible:ring-1 focus-visible:ring-[var(--devlog-accent)]/30",
        className
      )}
      style={{
        backgroundColor: "var(--devlog-bg-elevated)",
        borderColor: "var(--devlog-border)",
        color: "var(--devlog-text-primary)",
      }}
      {...props}
    />
  );
}

export { Textarea };
