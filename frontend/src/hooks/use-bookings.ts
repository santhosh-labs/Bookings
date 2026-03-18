import { useQuery, useMutation } from "@tanstack/react-query";
import type { Booking } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";

export function useBookings(workspaceId?: number | null, serviceId?: number | null) {
  const query = useQuery<Booking[]>({
    queryKey: ['/api/bookings', { workspaceId, serviceId }],
    queryFn: async () => {
      let url = "/api/bookings?";
      if (workspaceId) url += `workspaceId=${workspaceId}&`;
      if (serviceId) url += `serviceId=${serviceId}&`;
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });
  return { ...query, refresh: query.refetch };
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (booking: Omit<Booking, "id">) => {
      const res = await apiRequest("POST", "/api/bookings", booking);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    }
  });
}

export function useUpdateBookingStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    }
  });
}

export function useUpdateBooking() {
  return useMutation({
    mutationFn: async ({ id, ...update }: { id: number } & Partial<Booking>) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}`, update);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    }
  });
}
