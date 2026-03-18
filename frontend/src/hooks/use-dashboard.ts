import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export function useDashboardStats(workspaceId?: number | null, serviceId?: number | null) {
  const query = useQuery({
    queryKey: ['/api/stats', { workspaceId, serviceId }],
    queryFn: async () => {
      let url = "/api/stats?";
      if (workspaceId) url += `workspaceId=${workspaceId}&`;
      if (serviceId) url += `serviceId=${serviceId}&`;
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });
  return { ...query, refresh: query.refetch };
}
