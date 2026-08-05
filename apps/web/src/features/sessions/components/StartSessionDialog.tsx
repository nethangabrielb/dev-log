import { useEffect, useState } from "react";
import { useForm, useWatch, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkedToKind, SessionType, type SessionTodo } from "@devlog/types";
import {
  startSessionSchema,
  type StartSessionFormValues,
} from "../schemas/session.schema";
import { useActiveSession } from "../context/ActiveSessionContext";
import { useProjects } from "@/features/projects/hooks/useProjects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

export function StartSessionDialog({
  open,
  onOpenChange,
}: StartSessionDialogProps) {
  const { startSession } = useActiveSession();
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [todoInput, setTodoInput] = useState("");

  const { data: projects } = useProjects();

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

  const type = useWatch({ control, name: "type" });

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start Session</DialogTitle>
          <DialogDescription>
            Kick off a tracked work, study, or coding session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Type
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setProjectId("");
                  }}
                >
                  <SelectTrigger className="w-full">
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
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          {type === SessionType.PROJECT && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Linked Project (Optional)
              </label>
              <Select
                value={projectName}
                onValueChange={(v) => {
                  setProjectId(v ?? "");
                  setProjectName(
                    v
                      ? (projects?.data ?? []).find(
                          (p) => p._id === v || p.id === v,
                        )?.name ||
                          ""
                      : "",
                  );
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {(projects?.data ?? []).map((p) => (
                    <SelectItem key={p._id || p.id} value={p._id || p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                variant="outline"
                onClick={handleAddTodo}
                className="shrink-0"
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
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="flex-1 truncate">{field.name}</span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="cursor-pointer rounded-sm p-0.5 text-destructive transition-colors hover:bg-muted"
                      title="Remove todo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-accent text-accent-fg hover:bg-accent-dim"
            >
              Start Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
