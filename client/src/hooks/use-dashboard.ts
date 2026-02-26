import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboardStats.get.path],
    queryFn: async () => {
      const res = await fetch(api.dashboardStats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.dashboardStats.get.responses[200].parse(await res.json());
    },
  });
}
