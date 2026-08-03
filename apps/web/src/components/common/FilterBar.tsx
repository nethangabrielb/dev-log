import { useState } from "react";
import { SessionType } from "@devlog/types";
import { Input } from "@/components/ui/input";
import { SESSION_TYPE_COLOR } from "@/lib/formatters";

export interface FilterValues {
  type?: SessionType | "";
  startDate?: string;
  endDate?: string;
}

export interface FilterBarProps {
  filters?: FilterValues;
  onChange: (filters: FilterValues) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [selectedType, setSelectedType] = useState<string>(filters?.type || "");
  const [startDate, setStartDate] = useState<string>(filters?.startDate || "");
  const [endDate, setEndDate] = useState<string>(filters?.endDate || "");

  const handleTypeChange = (typeStr: string) => {
    setSelectedType(typeStr);
    onChange({
      type: (typeStr as SessionType) || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    onChange({
      type: (selectedType as SessionType) || undefined,
      startDate: val || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    onChange({
      type: (selectedType as SessionType) || undefined,
      startDate: startDate || undefined,
      endDate: val || undefined,
    });
  };

  const clearFilters = () => {
    setSelectedType("");
    setStartDate("");
    setEndDate("");
    onChange({});
  };

  const sessionTypes = Object.values(SessionType);

  return (
    <div
      className="flex flex-wrap items-center gap-3 p-3 rounded-lg border mb-4"
      style={{
        backgroundColor: "var(--devlog-bg-surface)",
        borderColor: "var(--devlog-border)",
      }}
    >
      <div className="flex items-center gap-2 flex-wrap flex-1">
        <span
          className="text-xs font-medium uppercase tracking-wider mr-1"
          style={{ color: "var(--devlog-text-secondary)" }}
        >
          Type:
        </span>
        <button
          type="button"
          onClick={() => handleTypeChange("")}
          className="px-2.5 py-1 text-xs font-mono rounded-md border font-medium transition-colors cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)",
            backgroundColor:
              selectedType === ""
                ? "var(--devlog-accent)"
                : "var(--devlog-bg-elevated)",
            color:
              selectedType === ""
                ? "var(--devlog-accent-fg)"
                : "var(--devlog-text-primary)",
            borderColor: "var(--devlog-border)",
          }}
        >
          All
        </button>
        {sessionTypes.map((st) => {
          const isSelected = selectedType === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => handleTypeChange(isSelected ? "" : st)}
              className="px-2.5 py-1 text-xs font-mono rounded-md border font-medium transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: isSelected
                  ? "var(--devlog-accent)"
                  : "var(--devlog-bg-elevated)",
                color: isSelected
                  ? "var(--devlog-accent-fg)"
                  : "var(--devlog-text-primary)",
                borderColor: "var(--devlog-border)",
              }}
            >
              <span className="flex items-center gap-1.5">
                {!isSelected && (
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full inline-block"
                    style={{
                      backgroundColor:
                        SESSION_TYPE_COLOR[st] || "var(--devlog-text-muted)",
                    }}
                  />
                )}
                {st}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--devlog-text-secondary)" }}
        >
          Dates:
        </span>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="h-8 w-36 text-xs"
        />
        <span style={{ color: "var(--devlog-text-muted)" }}>to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          className="h-8 w-36 text-xs"
        />
        {(selectedType || startDate || endDate) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs hover:underline ml-1 cursor-pointer"
            style={{ color: "var(--devlog-danger)" }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
