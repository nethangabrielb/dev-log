import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dailyReportsApi, type DailyReport } from "@/api/daily-reports.api";
import { keys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/lib/apiError";

export function useDailyReports() {
  return useQuery<DailyReport[]>({
    queryKey: keys.dailyReports.all(),
    queryFn: dailyReportsApi.findAll,
  });
}

export function useMarkDailyReportRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => dailyReportsApi.markAsRead(date),
    onMutate: async (date: string) => {
      await qc.cancelQueries({ queryKey: keys.dailyReports.all() });
      const previous = qc.getQueryData<DailyReport[]>(keys.dailyReports.all());
      qc.setQueryData<DailyReport[]>(keys.dailyReports.all(), (old) =>
        (old ?? []).map((report) =>
          report.date === date ? { ...report, isRead: true } : report
        )
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Report marked as read");
    },
    onError: (error, _vars, context) => {
      toast.error(
        getApiErrorMessage(error, "Failed to mark report as read")
      );
      if (context?.previous !== undefined) {
        qc.setQueryData(keys.dailyReports.all(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.dailyReports.all() });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
