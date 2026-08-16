import { LinkedToKind, SessionType } from "../enums/session.enum.js";

export interface SessionTodo {
  name: string;
  completed: boolean;
}

export interface SessionLinkedTo {
  kind: LinkedToKind;
  id: string;
}

export interface CreateSessionDto {
  type: SessionType;
  durationInSeconds: number;
  startedAt: Date | string;
  endedAt: Date | string;
  todos?: SessionTodo[];
  linkedTo?: SessionLinkedTo;
}

export interface SessionFilters {
  type?: SessionType;
  startDate?: string;
  endDate?: string;
}

export interface DailyActivityPoint {
  date: string;
  count: number;
  totalDuration: number;
}
