import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-[var(--devlog-accent)] focus-visible:ring-1 focus-visible:ring-[var(--devlog-accent)]/30",
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

export { Input };
