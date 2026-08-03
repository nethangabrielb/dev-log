import { useQuery } from "@tanstack/react-query";
import type { DsaStatistics } from "@devlog/types";
import { dsaApi } from "@/api/dsa.api";
import { keys } from "@/lib/queryKeys";

export function useDsaStats() {
  return useQuery<DsaStatistics>({
    queryKey: keys.dsa.stats(),
    queryFn: dsaApi.getStats,
  });
}
