import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  SessionType,
  type CreateSessionDto,
  type SessionLinkedTo,
  type SessionTodo,
} from "@devlog/types";
import { sessionsApi } from "@/api/sessions.api";

const STORAGE_KEY = "devlog-active-session";

export interface ActiveSessionState {
  type: SessionType;
  linkedTo?: SessionLinkedTo | null;
  startedAt: Date;
  todos: SessionTodo[];
}

interface ActiveSessionContextValue {
  activeSession: ActiveSessionState | null;
  startSession: (
    type: SessionType,
    linkedTo?: SessionLinkedTo | null,
    initialTodos?: SessionTodo[]
  ) => void;
  addTodo: (name: string) => void;
  toggleTodo: (index: number) => void;
  removeTodo: (index: number) => void;
  stopSession: () => Promise<void>;
  cancelSession: () => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextValue | null>(
  null
);

function loadStoredSession(): ActiveSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.type ||
      !parsed.startedAt ||
      !Array.isArray(parsed.todos)
    ) {
      return null;
    }
    return {
      type: parsed.type as SessionType,
      linkedTo: parsed.linkedTo ?? null,
      startedAt: new Date(parsed.startedAt),
      todos: parsed.todos as SessionTodo[],
    };
  } catch {
    return null;
  }
}

export function ActiveSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<ActiveSessionState | null>(
    loadStoredSession
  );

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...activeSession,
          startedAt: activeSession.startedAt.toISOString(),
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeSession]);

  const startSession = useCallback(
    (
      type: SessionType,
      linkedTo?: SessionLinkedTo | null,
      initialTodos?: SessionTodo[]
    ) => {
      setActiveSession({
        type,
        linkedTo: linkedTo ?? null,
        startedAt: new Date(),
        todos: initialTodos ?? [],
      });
    },
    []
  );

  const addTodo = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setActiveSession((prev) =>
      prev
        ? { ...prev, todos: [...prev.todos, { name: trimmed, completed: false }] }
        : prev
    );
  }, []);

  const toggleTodo = useCallback((index: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todos: prev.todos.map((todo, i) =>
          i === index ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    });
  }, []);

  const removeTodo = useCallback((index: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todos: prev.todos.filter((_, i) => i !== index),
      };
    });
  }, []);

  const stopSession = useCallback(async () => {
    const current = activeSession;
    if (!current) return;

    const endedAt = new Date();
    const durationInSeconds = Math.max(
      1,
      Math.round((endedAt.getTime() - current.startedAt.getTime()) / 1000)
    );

    const payload: CreateSessionDto = {
      type: current.type,
      durationInSeconds,
      startedAt: current.startedAt,
      endedAt,
      todos: current.todos,
      ...(current.linkedTo ? { linkedTo: current.linkedTo } : {}),
    };

    setActiveSession(null);

    try {
      await sessionsApi.create(payload);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  }, [activeSession, queryClient]);

  const cancelSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const value = useMemo<ActiveSessionContextValue>(
    () => ({
      activeSession,
      startSession,
      addTodo,
      toggleTodo,
      removeTodo,
      stopSession,
      cancelSession,
    }),
    [activeSession, startSession, addTodo, toggleTodo, removeTodo, stopSession, cancelSession]
  );

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveSession() {
  const ctx = useContext(ActiveSessionContext);
  if (!ctx) {
    throw new Error(
      "useActiveSession must be used within an ActiveSessionProvider"
    );
  }
  return ctx;
}
