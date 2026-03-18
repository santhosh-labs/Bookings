import { useQuery, useMutation } from "@tanstack/react-query";
import type { Service } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";

export function useServices(workspaceId?: number | null) {
  const query = useQuery<Service[]>({
    queryKey: workspaceId ? ["/api/services", { workspaceId }] : ["/api/services"],
    queryFn: async () => {
      const url = workspaceId ? `/api/services?workspaceId=${workspaceId}` : "/api/services";
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });
  return { ...query, refresh: query.refetch };
}

export function useService(id?: number | string) {
  return useQuery<Service>({
    queryKey: ["/api/services", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/services/${id}`);
      return res.json();
    },
    enabled: !!id
  });
}

export function useCreateService() {
  return useMutation({
    mutationFn: async (service: Omit<Service, "id">) => {
      const res = await apiRequest("POST", "/api/services", service);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/services"],
        exact: false
      });
    }
  });
}

export function useUpdateService() {
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Service> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/services/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/services"],
        exact: false
      });
    }
  });
}

export function useDeleteService() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/services"],
        exact: false
      });
    }
  });
}
