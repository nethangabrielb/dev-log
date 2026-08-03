import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { SessionType, LinkedToKind } from "@devlog/types";
import {
  createSessionSchema,
  type CreateSessionInput,
} from "../schemas/session.schema";
import { useCreateSession } from "../hooks/useSessions";
import { projectsApi } from "@/api/projects.api";
import { keys } from "@/lib/queryKeys";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface SessionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionFormSheet({ open, onOpenChange }: SessionFormSheetProps) {
  const { mutate: createSession, isPending } = useCreateSession();
  const [error, setError] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: keys.projects.all(),
    queryFn: projectsApi.findAll,
    enabled: open,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      sessionType: SessionType.PROJECT,
      title: "",
      durationInMinutes: 30,
      notes: "",
      projectId: "",
    },
  });

  const onSubmit = (data: CreateSessionInput) => {
    setError(null);
    const durationInSeconds = data.durationInMinutes * 60;
    const payload: any = {
      title: data.title,
      sessionType: data.sessionType,
      durationInSeconds,
      notes: data.notes || undefined,
    };

    if (data.projectId) {
      payload.linkedTo = {
        kind: LinkedToKind.PROJECT,
        id: data.projectId,
      };
    }

    createSession(payload, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.message || "Failed to log session. Try again."
        );
      },
    });
  };

  const sessionTypes = Object.values(SessionType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetClose onClick={() => onOpenChange(false)} />
      <div className="flex flex-col h-full justify-between">
        <div>
          <SheetHeader>
            <SheetTitle>Log New Session</SheetTitle>
            <SheetDescription>
              Record a work, study, or coding session into your log
            </SheetDescription>
          </SheetHeader>

          {error && (
            <div
              className="p-3 mb-4 text-sm rounded-md border"
              style={{
                backgroundColor: "rgba(248, 113, 113, 0.1)",
                borderColor: "var(--devlog-danger)",
                color: "var(--devlog-danger)",
              }}
            >
              {error}
            </div>
          )}

          <form id="session-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1 text-left">
              <label
                htmlFor="sessionType"
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                Type
              </label>
              <Controller
                name="sessionType"
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
              {errors.sessionType && (
                <p className="text-xs" style={{ color: "var(--devlog-danger)" }}>
                  {errors.sessionType.message}
                </p>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="title"
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                Title
              </label>
              <Input
                id="title"
                placeholder="e.g. Implemented Auth Interceptors"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs" style={{ color: "var(--devlog-danger)" }}>
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="durationInMinutes"
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                Duration (minutes)
              </label>
              <Input
                id="durationInMinutes"
                type="number"
                min={1}
                placeholder="30"
                {...register("durationInMinutes", { valueAsNumber: true })}
              />
              {errors.durationInMinutes && (
                <p className="text-xs" style={{ color: "var(--devlog-danger)" }}>
                  {errors.durationInMinutes.message}
                </p>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="projectId"
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                Linked Project (Optional)
              </label>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {projects.map((p: any) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>
                          {p.name || p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="notes"
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--devlog-text-secondary)" }}
              >
                Notes (Optional)
              </label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Key takeaways, learnings, or summary..."
                {...register("notes")}
              />
            </div>
          </form>
        </div>

        <div className="pt-4 mt-6 border-t" style={{ borderColor: "var(--devlog-border)" }}>
          <Button
            type="submit"
            form="session-form"
            disabled={isPending}
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
            {isPending ? "Logging Session..." : "Save Session"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

export default SessionFormSheet;
