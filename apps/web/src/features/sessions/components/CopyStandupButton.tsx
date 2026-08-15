import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  formatStandupSummary,
  formatDate,
  type StandupSessionItem,
} from "@/lib/formatters";
import { getApiErrorMessage } from "@/lib/apiError";

export interface CopyStandupButtonProps {
  /** Pre-loaded sessions from TanStack Query cache / hook */
  sessions?: StandupSessionItem[];
  /** Loading state of the session query */
  isLoading?: boolean;
  /** Optional custom class name */
  className?: string;
}

export function CopyStandupButton({
  sessions = [],
  isLoading = false,
  className,
}: CopyStandupButtonProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    if (isLoading) return;

    if (sessions.length === 0) {
      toast.info("No sessions logged today to generate a standup.");
      return;
    }

    try {
      setIsCopying(true);

      const standupText = formatStandupSummary(sessions, {
        dateHeader: formatDate(new Date().toISOString()),
        includeTotalTime: true,
      });

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(standupText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = standupText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setHasCopied(true);
      toast.success("Standup copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to copy standup to clipboard")
      );
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isCopying || isLoading || sessions.length === 0}
      onClick={handleCopy}
      title={
        sessions.length === 0
          ? "No sessions logged today"
          : "Copy daily standup to clipboard"
      }
      className={`gap-1.5 border font-medium text-xs transition-colors ${
        sessions.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className || ""}`}
      style={{
        backgroundColor: "var(--devlog-bg-surface)",
        borderColor: "var(--devlog-border)",
        color: "var(--devlog-text-primary)",
      }}
    >
      {isCopying ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
      ) : hasCopied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy
          className="h-3.5 w-3.5"
          style={{ color: "var(--devlog-accent)" }}
        />
      )}
      <span>
        {isCopying ? "Copying..." : hasCopied ? "Copied!" : "Copy Standup"}
      </span>
    </Button>
  );
}
