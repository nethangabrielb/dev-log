import { useState, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { ExportFormat, SessionType } from "@devlog/types";
import { useExportSessions } from "../hooks/useSessions";
import type { FilterValues } from "@/components/common/FilterBar";
import { Button } from "@/components/ui/button";

export interface ExportSessionsButtonProps {
  filters?: FilterValues;
  className?: string;
}

export function ExportSessionsButton({
  filters,
  className,
}: ExportSessionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mutate: exportSessions, isPending } = useExportSessions();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);
    exportSessions({
      format,
      type: filters?.type ? (filters.type as SessionType) : undefined,
      startDate: filters?.startDate || undefined,
      endDate: filters?.endDate || undefined,
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`gap-1.5 border font-medium transition-colors cursor-pointer ${className || ""}`}
        style={{
          backgroundColor: "var(--devlog-bg-surface)",
          borderColor: "var(--devlog-border)",
          color: "var(--devlog-text-primary)",
        }}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        ) : (
          <Download
            className="h-4 w-4"
            style={{ color: "var(--devlog-accent)" }}
          />
        )}
        <span>{isPending ? "Exporting..." : "Export"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: "var(--devlog-text-secondary)" }}
        />
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-56 rounded-lg border shadow-xl z-50 py-1 origin-top-right animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            backgroundColor: "var(--devlog-bg-elevated)",
            borderColor: "var(--devlog-border)",
          }}
        >
          <div
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border-b"
            style={{
              color: "var(--devlog-text-muted)",
              borderColor: "var(--devlog-border-subtle)",
            }}
          >
            Export Format
          </div>

          <button
            type="button"
            onClick={() => handleExport(ExportFormat.CSV)}
            className="w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors cursor-pointer group"
            style={{
              color: "var(--devlog-text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--devlog-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FileSpreadsheet
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: "var(--devlog-accent)" }}
            />
            <div>
              <div className="text-xs font-medium font-mono">CSV (.csv)</div>
              <div
                className="text-[11px] leading-tight mt-0.5"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                Spreadsheet & data tables
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleExport(ExportFormat.MARKDOWN)}
            className="w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors cursor-pointer group"
            style={{
              color: "var(--devlog-text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--devlog-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FileText
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: "var(--devlog-accent)" }}
            />
            <div>
              <div className="text-xs font-medium font-mono">
                Markdown (.md)
              </div>
              <div
                className="text-[11px] leading-tight mt-0.5"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                Formatted table for notes & logs
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
