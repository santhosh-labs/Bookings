import { useState, useEffect } from "react";
import { Users, Info, ChevronDown } from "lucide-react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useCreateRecruiter } from "../../hooks/use-recruiters";
import { useToast } from "../../hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";

interface InviteRecruiterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function InviteRecruiterModal({ isOpen, onClose, onSuccess }: InviteRecruiterModalProps) {
    const { workspaces, currentWorkspace } = useWorkspace();
    const { mutateAsync: createRecruiter, isPending } = useCreateRecruiter();
    const { toast } = useToast();

    const [inviteEmails, setInviteEmails] = useState("");
    const [inviteWorkspaceId, setInviteWorkspaceId] = useState("");
    const [inviteRole, setInviteRole] = useState("Staff");

    // Initialize with current workspace
    useEffect(() => {
        if (currentWorkspace?.id) {
            setInviteWorkspaceId(currentWorkspace.id.toString());
        }
    }, [currentWorkspace, isOpen]);

    const handleInvite = async () => {
        if (!inviteEmails.trim() || !inviteWorkspaceId) return;

        const emails = inviteEmails.split(/[, \n]+/).filter(e => e.trim());
        if (emails.length === 0) return;

        try {
            const promises = emails.map(email =>
                createRecruiter({
                    workspaceId: Number(inviteWorkspaceId),
                    name: email.split('@')[0],
                    username: email, // Use email as username
                    password: "TemporaryPassword123!", // Default password
                    email,
                    role: inviteRole,
                    isActive: true,
                    avatar: null,
                    phone: null,
                    designation: null,
                    gender: null,
                    dateOfBirth: null,
                    additionalInfo: null
                })
            );

            await Promise.all(promises);

            toast({
                title: "Invitations Sent",
                description: `Successfully invited ${emails.length} recruiter${emails.length > 1 ? 's' : ''}.`,
            });

            if (onSuccess) onSuccess();
            onClose();
            setInviteEmails("");
        } catch (error) {
            console.error("Failed to invite recruiters:", error);
            toast({
                title: "Error",
                description: "Failed to send invitations. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-[19px] font-bold text-slate-800 leading-tight">Invite Recruiters</DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500 font-medium mt-0.5">Add new members to help manage your bookings</DialogDescription>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Emails Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Email addresses</label>
                            <span className="text-[11px] text-slate-400 font-medium">Comma or space separated</span>
                        </div>
                        <textarea
                            value={inviteEmails}
                            onChange={(e) => setInviteEmails(e.target.value)}
                            placeholder="e.g. alex@example.com, sara@example.com"
                            rows={3}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14.5px] focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 text-slate-700 bg-slate-50/30 resize-none font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Workspaces Field */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Workspace</label>
                            <Select value={inviteWorkspaceId} onValueChange={setInviteWorkspaceId}>
                                <SelectTrigger className="w-full h-11 px-4 rounded-xl border-slate-200 bg-white text-[14.5px] font-medium text-slate-700 focus:ring-4 focus:ring-slate-100 transition-all">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-slate-200 shadow-2xl bg-white z-[1100]">
                                    {workspaces.map(ws => (
                                        <SelectItem key={ws.id} value={ws.id.toString()} className="py-2.5 cursor-pointer focus:bg-slate-50">
                                            {ws.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Role Field */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Permission Role</label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger className="w-full h-11 px-4 rounded-xl border-slate-200 bg-white text-[14.5px] font-medium text-slate-700 focus:ring-4 focus:ring-slate-100 transition-all">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-slate-200 shadow-2xl bg-white z-[1100]">
                                    <SelectItem value="Staff" className="py-2.5 cursor-pointer focus:bg-slate-50">Staff Member</SelectItem>
                                    <SelectItem value="Manager" className="py-2.5 cursor-pointer focus:bg-slate-50">Manager</SelectItem>
                                    <SelectItem value="Admin" className="py-2.5 cursor-pointer focus:bg-slate-50">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 flex gap-3 items-start border border-slate-100">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                            New recruits will receive an email invitation to join the selected workspace with the specified permissions.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
                    <button
                        onClick={onClose}
                        className="h-10 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={isPending || !inviteEmails.trim() || !inviteWorkspaceId}
                        className={cn(
                            "h-10 px-8 rounded-xl font-bold text-[13px] transition-all shadow-md flex items-center gap-2",
                            isPending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-800 text-white hover:bg-black active:scale-[0.98]"
                        )}
                    >
                        {isPending ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : "Send Invitation"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
