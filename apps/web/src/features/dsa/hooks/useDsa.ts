import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QueryClient } from "@tanstack/react-query";
import {
  dsaApi,
  type CreateDsaDto,
  type DsaFilters,
  type DsaRecord,
  type UpdateDsaDto,
} from "@/api/dsa.api";
import { keys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/lib/apiError";

export function useDsa(filters?: DsaFilters) {
  return useQuery<DsaRecord[]>({
    queryKey: keys.dsa.all(filters),
    queryFn: () => dsaApi.findAll(filters),
  });
}

function applyToDsaCache(
  qc: QueryClient,
  mutate: (problem: DsaRecord) => DsaRecord | null
) {
  for (const [queryKey] of qc.getQueriesData({ queryKey: ["dsa"] })) {
    qc.setQueryData(queryKey, (old: unknown) => {
      const apply = (list?: DsaRecord[] | null): DsaRecord[] | undefined =>
        list
          ?.map(mutate)
          .filter((p): p is DsaRecord => p !== null);

      if (Array.isArray(old)) return apply(old);
      if (old && typeof old === "object") {
        const record = old as { data?: DsaRecord[]; items?: DsaRecord[] };
        if (Array.isArray(record.data)) return { ...record, data: apply(record.data) };
        if (Array.isArray(record.items)) return { ...record, items: apply(record.items) };
      }
      return old;
    });
  }
}

export function useCreateDsa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDsaDto) => dsaApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dsa"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Problem added");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to add problem"));
    },
  });
}

export function useUpdateDsa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDsaDto }) =>
      dsaApi.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await qc.cancelQueries({ queryKey: ["dsa"] });
      const previous = qc.getQueriesData({ queryKey: ["dsa"] });
      applyToDsaCache(qc, (problem) => {
        const problemId = problem._id || problem.id;
        if (problemId !== id) return problem;
        return { ...problem, ...dto } as DsaRecord;
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Problem updated");
    },
    onError: (error, _vars, context) => {
      toast.error(getApiErrorMessage(error, "Failed to update problem"));
      for (const [queryKey, data] of context?.previous ?? []) {
        qc.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["dsa"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteDsa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dsaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dsa"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Problem deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete problem"));
    },
  });
}
