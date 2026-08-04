import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dsaApi,
  type CreateDsaDto,
  type DsaFilters,
  type DsaRecord,
  type UpdateDsaDto,
} from "@/api/dsa.api";
import { keys } from "@/lib/queryKeys";

export function useDsa(filters?: DsaFilters) {
  return useQuery<DsaRecord[]>({
    queryKey: keys.dsa.all(filters),
    queryFn: () => dsaApi.findAll(filters),
  });
}

export function useCreateDsa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDsaDto) => dsaApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dsa"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDsa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDsaDto }) =>
      dsaApi.update(id, dto),
    onSuccess: () => {
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
    },
  });
}
