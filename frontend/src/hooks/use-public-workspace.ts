import { useQuery } from "@tanstack/react-query";
import { Workspace } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";

export function usePublicWorkspace(slugOrId?: string) {
    return useQuery<Workspace>({
        queryKey: ["/api/workspaces", slugOrId],
        queryFn: async () => {
            if (!slugOrId) throw new Error("No slug/id provided");
            
            // Check if slugOrId is numeric (ID) or string (Slug)
            const isId = !isNaN(Number(slugOrId));
            const url = isId 
                ? `/api/workspaces/${slugOrId}` 
                : `/api/workspaces/slug/${slugOrId}`;
                
            const res = await apiRequest("GET", url);
            return res.json();
        },
        enabled: !!slugOrId
    });
}
