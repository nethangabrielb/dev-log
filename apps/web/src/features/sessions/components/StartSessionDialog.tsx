import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { LinkedToKind, SessionType, type SessionTodo } from "@devlog/types";
import {
  startSessionSchema,
  type StartSessionFormValues,
} from "../schemas/session.schema";
import { useActiveSession } from "../context/ActiveSessionContext";
import { projectsApi } from "@/api/projects.api";
import { keys } from "@/lib/queryKeys";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

export interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectOption {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
}

export function StartSessionDialog({
  open,
  onOpenChange,
}: StartSessionDialogProps) {
  const { startSession } = useActiveSession();
  const [projectId, setProjectId] = useState("");
  const [todoInput, setTodoInput] = useState("");

  const { data: projects = [] } = useQuery<ProjectOption[]>({
    queryKey: keys.projects.all(),
    queryFn: projectsApi.findAll,
    enabled: open,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StartSessionFormValues>({
    resolver: zodResolver(startSessionSchema),
    defaultValues: {
      type: SessionType.PROJECT,
      startedAt: new Date(),
      todos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "todos",
  });

  useEffect(() => {
    if (open) {
      reset({
        type: SessionType.PROJECT,
        startedAt: new Date(),
        todos: [],
      });
    }
  }, [open, reset]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setProjectId("");
      setTodoInput("");
    }
    onOpenChange(next);
  };

  const handleAddTodo = () => {
    const name = todoInput.trim();
    if (!name) return;
    append({ name, completed: false });
    setTodoInput("");
  };

  const onSubmit = (data: StartSessionFormValues) => {
    const initialTodos: SessionTodo[] = (data.todos ?? []).map((todo) => ({
      name: todo.name,
      completed: false,
    }));
    const linkedTo = projectId
      ? { kind: LinkedToKind.PROJECT as const, id: projectId }
      : undefined;
    startSession(data.type, linkedTo, initialTodos);
    handleOpenChange(false);
  };

  const sessionTypes = Object.values(SessionType);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogClose onClick={() => handleOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Start Session</DialogTitle>
        <DialogDescription>
          Kick off a tracked work, study, or coding session
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1 text-left">
          <label
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--devlog-text-secondary)" }}
          >
            Type
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <p className="text-xs" style={{ color: "var(--devlog-danger)" }}>
              {errors.type.message}
            </p>
          )}
        </div>

        <div className="space-y-1 text-left">
          <label
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--devlog-text-secondary)" }}
          >
            Linked Project (Optional)
          </label>
          <Select value={projectId} onValueChange={(v) => setProjectId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p._id || p.id} value={p._id || p.id}>
                  {p.name || p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 text-left">
          <label
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--devlog-text-secondary)" }}
          >
            Todos (Optional)
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTodo();
                }
              }}
              placeholder="Add a task..."
            />
            <Button
              type="button"
              onClick={handleAddTodo}
              className="h-9 shrink-0 cursor-pointer gap-1 border-0 shadow-none"
              style={{
                backgroundColor: "var(--devlog-bg-elevated)",
                color: "var(--devlog-text-primary)",
              }}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {fields.length > 0 && (
            <ul className="space-y-1.5 pt-2">
              {fields.map((field, index) => (
                <li
                  key={field.id}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--devlog-text-secondary)" }}
                >
                  <span className="flex-1 truncate">{field.name}</span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-[var(--devlog-bg-hover)]"
                    style={{ color: "var(--devlog-danger)" }}
                    title="Remove todo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full font-medium transition-colors cursor-pointer border-0 shadow-none"
            style={{
              backgroundColor: "var(--devlog-accent)",
              color: "var(--devlog-accent-fg)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--devlog-accent-dim)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--devlog-accent)")
            }
          >
            Start Session
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
