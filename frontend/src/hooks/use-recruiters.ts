import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export function useRecruiters(workspaceId?: number | null) {
    const { data = [], isLoading, refetch } = useQuery<any[]>({
        queryKey: ["/api/users", { workspaceId }],
        queryFn: async () => {
            const url = workspaceId ? `/api/users?workspaceId=${workspaceId}` : "/api/users";
            const res = await apiRequest("GET", url);
            return res.json();
        },
        enabled: (workspaceId !== undefined && workspaceId !== null) || !!localStorage.getItem("token")
    });

    return {
        data,
        isLoading,
        refresh: refetch
    };
}

export function useCreateRecruiter() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (member: any) => {
            const res = await apiRequest("POST", "/api/users", member);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        }
    });
}
