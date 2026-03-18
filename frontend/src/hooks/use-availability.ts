import { useQuery, useMutation } from "@tanstack/react-query";
import type { Availability } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";

export function useAvailability(workspaceId?: number | null) {
  const query = useQuery<Availability>({
    queryKey: workspaceId ? ["/api/availability", { workspaceId }] : ["/api/availability"],
    queryFn: async () => {
      const url = workspaceId ? `/api/availability?workspaceId=${workspaceId}` : "/api/availability";
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });
  return { ...query, refresh: query.refetch };
}

export function useUpdateAvailability() {
  return useMutation({
    mutationFn: async (data: { schedule: any; timezone: string; workspaceId?: number }) => {
      const url = data.workspaceId ? `/api/availability?workspaceId=${data.workspaceId}` : `/api/availability`;
      const res = await apiRequest("PUT", url, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
    }
  });
}
