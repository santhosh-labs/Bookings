import { useQuery, useMutation } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";

export function useCustomers(workspaceId?: number | null) {
  const query = useQuery<Customer[]>({
    queryKey: workspaceId ? ["/api/customers", { workspaceId }] : ["/api/customers"],
    queryFn: async () => {
      const url = workspaceId ? `/api/customers?workspaceId=${workspaceId}` : "/api/customers";
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });
  return { ...query, refresh: query.refetch };
}

export function useCreateCustomer() {
  return useMutation({
    mutationFn: async (customer: Omit<Customer, "id" | "totalBookings" | "lastBooking">) => {
      const res = await apiRequest("POST", "/api/customers", customer);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    }
  });
}
