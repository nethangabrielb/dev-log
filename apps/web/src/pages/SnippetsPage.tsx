import { useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import type { Snippet } from "@/api/snippets.api";
import {
  useSnippets,
  useCreateSnippet,
  useUpdateSnippet,
  useDeleteSnippet,
} from "@/features/snippets/hooks/useSnippets";
import { SnippetGrid } from "@/features/snippets/components/SnippetGrid";
import { SnippetSheet } from "@/features/snippets/components/SnippetSheet";
import { SnippetDialog } from "@/features/snippets/components/SnippetDialog";
import { SnippetViewSheet } from "@/features/snippets/components/SnippetViewSheet";
import type { SnippetFormValues } from "@/features/snippets/schemas/snippet.schema";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getApiErrorMessage } from "@/lib/apiError";

export function SnippetsPage() {
  const { data: rawSnippets, isLoading, isError, error } = useSnippets();
  const { mutate: createSnippet, isPending: isCreatePending } =
    useCreateSnippet();
  const { mutate: updateSnippet, isPending: isUpdatePending } =
    useUpdateSnippet();
  const { mutate: deleteSnippet } = useDeleteSnippet();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [viewing, setViewing] = useState<Snippet | null>(null);

  const snippets = useMemo<Snippet[]>(() => {
    return rawSnippets?.data ?? [];
  }, [rawSnippets]);

  const handleCreate = (values: SnippetFormValues) => {
    createSnippet(values, { onSuccess: () => setIsSheetOpen(false) });
  };

  const handleUpdate = (values: SnippetFormValues) => {
    if (!editing) return;
    const id = editing._id || editing.id || "";
    if (!id) return;
    updateSnippet({ id, dto: values }, { onSuccess: () => setEditing(null) });
  };

  const handleDelete = (snippet: Snippet) => {
    const id = snippet._id || snippet.id || "";
    if (!id) return;
    if (confirm("Are you sure you want to delete this snippet?")) {
      deleteSnippet(id);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Snippets</h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Searchable library of code snippets you reference often
            </p>
          </div>
          <Button
            onClick={() => setIsSheetOpen(true)}
            className="gap-2 bg-accent text-accent-fg hover:bg-accent-dim"
          >
            <Plus className="h-4 w-4" />
            <span>Add Snippet</span>
          </Button>
        </div>

        {isError && (
          <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 my-4 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {getApiErrorMessage(
                error,
                "Failed to load snippets. Make sure the backend server is running."
              )}
            </span>
          </div>
        )}

        <SnippetGrid
          snippets={snippets}
          loading={isLoading}
          onOpen={setViewing}
          onEdit={setEditing}
          onDelete={handleDelete}
          onAdd={() => setIsSheetOpen(true)}
        />

        <SnippetSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          submitting={isCreatePending}
          onSubmit={handleCreate}
        />
        <SnippetDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          snippet={editing ?? undefined}
          submitting={isUpdatePending}
          onSubmit={handleUpdate}
        />
        <SnippetViewSheet
          snippet={viewing}
          onOpenChange={(open) => !open && setViewing(null)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default SnippetsPage;
