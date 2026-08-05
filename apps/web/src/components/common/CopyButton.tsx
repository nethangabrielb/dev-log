import { useState, useCallback, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  value: string;
  className?: string;
  title?: string;
  children?: ReactNode;
}

export function CopyButton({
  value,
  className,
  title,
  children,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = value;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    },
    [value]
  );

  return (
    <Button
      variant="outline"
      size="icon-xs"
      className={cn(
        "bg-bg-elevated/80 backdrop-blur-xs hover:bg-bg-hover text-text-secondary hover:text-text-primary border-border-subtle transition-all",
        copied && "text-success border-success/40",
        className
      )}
      onClick={handleCopy}
      title={title || (copied ? "Copied!" : "Copy code")}
      aria-label={copied ? "Copied code" : "Copy code"}
    >
      {children ? (
        children
      ) : copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}
