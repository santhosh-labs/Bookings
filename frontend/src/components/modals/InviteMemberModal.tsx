import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Mail, User, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { useCreateRecruiter } from "../../hooks/use-recruiters";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
    const { currentWorkspace } = useWorkspace();
    const { mutateAsync: createMember, isPending } = useCreateRecruiter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("Staff");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorkspace?.id) return;

        try {
            await createMember({
                workspaceId: currentWorkspace.id,
                name,
                email,
                role,
                username: email.split('@')[0] + Math.random().toString(36).substring(7),
                password: "Password123!", // Default password for invited members
                isActive: true,
                avatar: null,
                phone: null,
                designation: null,
                gender: null,
                dateOfBirth: null,
                additionalInfo: null
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setName("");
                setEmail("");
                setRole("Staff");
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to invite member:", error);
            alert("Failed to invite member. Please check if the email is already in use.");
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 scale-95"
                            enterTo="opacity-100 translate-y-0 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 scale-100"
                            leaveTo="opacity-0 translate-y-4 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                                {isSuccess ? (
                                    <div className="p-10 text-center space-y-4">
                                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 animate-bounce">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900">Invitation Sent!</h2>
                                        <p className="text-slate-500 font-medium">
                                            We've sent an invitation link to <strong>{email}</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInvite} className="p-8 space-y-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="space-y-1">
                                                <h2 className="text-2xl font-bold text-slate-900">Invite Team Member</h2>
                                                <p className="text-sm text-slate-500 font-medium">Add a new recruiter to your workspace.</p>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={onClose}
                                                className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input 
                                                        id="name"
                                                        placeholder="Santhosh S"
                                                        required
                                                        value={name}
                                                        onChange={e => setName(e.target.value)}
                                                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input 
                                                        id="email"
                                                        type="email"
                                                        placeholder="sangcloudx.io@gmail.com"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Permissions Role</Label>
                                                <Select value={role} onValueChange={setRole}>
                                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-slate-400" />
                                                            <SelectValue />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Staff" className="font-medium">Recruiter</SelectItem>
                                                        <SelectItem value="Admin" className="font-medium">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <Button 
                                                type="button"
                                                variant="outline" 
                                                onClick={onClose}
                                                className="flex-1 h-12 rounded-xl border-slate-200 font-bold"
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                type="submit"
                                                disabled={isPending || !name || !email}
                                                className="flex-2 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-xl shadow-slate-200"
                                            >
                                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                Send Invitation
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
