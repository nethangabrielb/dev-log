import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <Loader2
        className="h-8 w-8 animate-spin"
        style={{ color: "var(--accent)" }}
      />
    </div>
  );
}
