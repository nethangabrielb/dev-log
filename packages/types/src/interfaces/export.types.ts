import { ExportFormat } from "../enums/export.enum.js";
import { SessionType } from "../enums/session.enum.js";

export type ExportFormatType = "csv" | "markdown";

export interface ExportDateRange {
  startDate?: string;
  endDate?: string;
}

export interface ExportRequest {
  format: ExportFormat | ExportFormatType;
  startDate?: string;
  endDate?: string;
  dateRange?: ExportDateRange;
  type?: SessionType;
}

export interface SessionExportRequest extends ExportRequest {}
