import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  snippetsApi,
  type CreateSnippetDto,
  type Snippet,
  type UpdateSnippetDto,
} from "@/api/snippets.api";
import { keys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/lib/apiError";

export function useSnippets() {
  return useQuery<Snippet[]>({
    queryKey: keys.snippets.all(),
    queryFn: snippetsApi.findAll,
  });
}

export function useCreateSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSnippetDto) => snippetsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snippets"] });
      toast.success("Snippet created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create snippet"));
    },
  });
}

export function useUpdateSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSnippetDto }) =>
      snippetsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snippets"] });
      toast.success("Snippet updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update snippet"));
    },
  });
}

export function useDeleteSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => snippetsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snippets"] });
      toast.success("Snippet deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete snippet"));
    },
  });
}
