import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAvailability() {
  return useQuery({
    queryKey: [api.availability.get.path],
    queryFn: async () => {
      const res = await fetch(api.availability.get.path, { credentials: "include" });
      if (res.status === 404) return null; // Handle if no availability set yet
      if (!res.ok) throw new Error("Failed to fetch availability");
      return api.availability.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { schedule: any; timezone: string }) => {
      const res = await fetch(api.availability.update.path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update availability");
      return api.availability.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.availability.get.path] }),
  });
}
