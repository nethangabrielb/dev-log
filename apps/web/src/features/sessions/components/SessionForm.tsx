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
  SheetContent,
  SheetFooter,
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

interface ProjectOption {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
}

interface CreateSessionPayload {
  title: string;
  sessionType: SessionType;
  durationInSeconds: number;
  notes?: string;
  linkedTo?: {
    kind: LinkedToKind;
    id: string;
  };
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
    const payload: CreateSessionPayload = {
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
      onError: (error: unknown) => {
        const responseError = error as {
          response?: { data?: { message?: string } };
        };
        setError(
          responseError?.response?.data?.message ||
            "Failed to log session. Try again."
        );
      },
    });
  };

  const sessionTypes = Object.values(SessionType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log New Session</SheetTitle>
          <SheetDescription>
            Record a work, study, or coding session into your log
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="p-3 text-sm rounded-md border border-destructive/40 bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <form
          id="session-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="sessionType"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Type
            </label>
            <Controller
              name="sessionType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
            {errors.sessionType && (
              <p className="text-xs text-destructive">
                {errors.sessionType.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="title"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Title
            </label>
            <Input
              id="title"
              placeholder="e.g. Implemented Auth Interceptors"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="durationInMinutes"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
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
              <p className="text-xs text-destructive">
                {errors.durationInMinutes.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="projectId"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Linked Project (Optional)
            </label>
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects.map((p: ProjectOption) => (
                      <SelectItem key={p._id || p.id} value={p._id || p.id}>
                        {p.name || p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="notes"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
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

        <SheetFooter>
          <Button
            type="submit"
            form="session-form"
            disabled={isPending}
            className="w-full bg-accent text-accent-fg hover:bg-accent-dim"
          >
            {isPending ? "Logging Session..." : "Save Session"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default SessionFormSheet;
