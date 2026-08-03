import { useQuery } from "@tanstack/react-query";
import { dsaApi } from "@/api/dsa.api";
import { keys } from "@/lib/queryKeys";

export function useDsaStats() {
  return useQuery({
    queryKey: keys.dsa.stats(),
    queryFn: dsaApi.getStats,
  });
}
