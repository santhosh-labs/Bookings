import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Workflow } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";

export function useWorkflows(workspaceId?: number | null) {
    const { data = [], isLoading, refetch } = useQuery<Workflow[]>({
        queryKey: workspaceId ? ["workflows", { workspaceId }] : ["workflows"],
        queryFn: async () => {
            const url = workspaceId ? `/api/workflows?workspaceId=${workspaceId}` : "/api/workflows";
            const res = await apiRequest("GET", url);
            return res.json();
        }
    });

    return {
        data,
        isLoading,
        refresh: refetch
    };
}

export function useCreateWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workflow: Omit<Workflow, "id">) => {
            const res = await apiRequest("POST", "/api/workflows", workflow);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        }
    });
}

export function useDeleteWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/workflows/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        }
    });
}
