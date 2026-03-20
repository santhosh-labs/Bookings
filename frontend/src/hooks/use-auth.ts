import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, Staff } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading, error } = useQuery<User | null>({
        queryKey: ["/api/me"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            if (!token) return null;
            try {
                const res = await apiRequest("GET", "/api/me");
                return res.json();
            } catch (e) {
                localStorage.removeItem("token");
                return null;
            }
        },
        retry: false
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: any) => {
            const res = await apiRequest("POST", "/api/login", credentials);
            return res.json();
        },
        onSuccess: (data) => {
            localStorage.setItem("token", data.token);
            if (data.workspaces && data.workspaces.length > 0) {
               localStorage.setItem("role", data.workspaces[0].role);
            }
            queryClient.setQueryData(["/api/me"], data.user);
            queryClient.invalidateQueries();
        }
    });

    const registerMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/register", data);
            return res.json();
        },
        onSuccess: (data) => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "SUPER_ADMIN");
            queryClient.setQueryData(["/api/me"], data.user);
            queryClient.invalidateQueries();
        }
    });

    const switchWorkspaceMutation = useMutation({
        mutationFn: async (organizationId: number) => {
            const res = await apiRequest("POST", "/api/auth/switch-workspace", { organizationId });
            return res.json();
        },
        onSuccess: (data) => {
            const currentUser = queryClient.getQueryData(["/api/me"]);
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            
            // Clear cache but preserve current user to prevent AuthGuard redirect loops
            queryClient.clear();
            if (currentUser) {
                queryClient.setQueryData(["/api/me"], currentUser);
            }
            queryClient.invalidateQueries();
        }
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/me"], null);
            queryClient.invalidateQueries();
        }
    });

    return {
        user,
        isLoading,
        error,
        login: loginMutation,
        register: registerMutation,
        logout: logoutMutation,
        switchWorkspace: switchWorkspaceMutation
    };
}

export function useMe() {
    return useQuery<Staff | null>({
        queryKey: ["/api/me"],
        queryFn: async () => {
            try {
                const res = await apiRequest("GET", "/api/me");
                return res.json();
            } catch (e) {
                return null;
            }
        },
        retry: false
    });
}
