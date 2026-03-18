import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Workspace } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "../hooks/use-auth";

type WorkspaceContextType = {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    isLoading: boolean;
    setCurrentWorkspaceById: (id: number | null) => Promise<void>;
    addWorkspace: (workspace: Omit<Workspace, "id">) => Promise<void>;
    role: string | null;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, switchWorkspace } = useAuth();
    const [role, setRole] = useState<string | null>(localStorage.getItem("role"));

    const { data: workspaces = [], isLoading } = useQuery<Workspace[]>({
        queryKey: ["/api/workspaces"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/workspaces");
            return res.json();
        },
        enabled: !!user,
        retry: false
    });

    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

    const setCurrentWorkspaceById = useCallback(async (id: number | null) => {
        if (id === null) {
            setCurrentWorkspace(null);
            localStorage.removeItem("selected_workspace_id");
            localStorage.removeItem("role");
            setRole(null);
            return;
        }

        const ws = workspaces.find((w) => w.id === id);
        if (ws) {
            try {
                const data = await switchWorkspace.mutateAsync(id);
                setCurrentWorkspace(ws);
                setRole(data.role);
                localStorage.setItem("selected_workspace_id", id.toString());
            } catch (err) {
                console.error("Failed to switch workspace:", err);
            }
        }
    }, [workspaces, switchWorkspace]);

    // Initial load persistence
    useEffect(() => {
        const savedId = localStorage.getItem("selected_workspace_id");
        if (savedId && workspaces.length > 0 && !currentWorkspace) {
            const ws = workspaces.find(w => w.id === Number(savedId));
            if (ws) {
                setCurrentWorkspace(ws);
                setRole(localStorage.getItem("role"));
            } else {
                // If saved workspace not found, reset
                localStorage.removeItem("selected_workspace_id");
            }
        }
    }, [workspaces, currentWorkspace]);

    // Auto-select first workspace if none selected
    useEffect(() => {
        if (user && workspaces.length > 0 && !currentWorkspace && !localStorage.getItem("selected_workspace_id")) {
             setCurrentWorkspaceById(workspaces[0].id);
        }
    }, [user, workspaces, currentWorkspace, setCurrentWorkspaceById]);

    const addWorkspace = async (workspaceData: Omit<Workspace, "id">) => {
        const res = await apiRequest("POST", "/api/workspaces", workspaceData);
        const newWorkspace = await res.json();
        queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
        await setCurrentWorkspaceById(newWorkspace.id);
    };

    return (
        <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, isLoading, setCurrentWorkspaceById, addWorkspace, role }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
};
