import { useState } from "react";
import { Plus, Users, Mail, Shield, MoreVertical, Loader2, Search, UserMinus, UserPlus, Fingerprint } from "lucide-react";
import { useRecruiters } from "../hooks/use-recruiters";
import InviteMemberModal from "../components/modals/InviteMemberModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Recruiters() {
    const { data: recruiters = [], isLoading } = useRecruiters();
    const [search, setSearch] = useState("");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const filtered = recruiters.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Members</h1>
                    <p className="text-slate-500 font-medium">Manage recruiters and administrative access for this workspace.</p>
                </div>
                <Button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl shadow-slate-200 gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    Invite Member
                </Button>
            </div>

            <InviteMemberModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
            />

            {/* Table Area */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..." 
                            className="pl-10 h-10 bg-white border-slate-200 rounded-xl font-medium"
                        />
                    </div>
                    <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 font-bold px-3 py-1">
                        {filtered.length} Total members
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Member Details</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Security Role</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-200" />
                                        <p className="mt-4 text-slate-400 font-bold">Synchronizing team members...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                            <UserMinus className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">No members found</h3>
                                        <p className="text-slate-500 font-medium">Try adjusting your search or invite a new team member.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((recruiter) => (
                                    <tr key={recruiter.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-11 h-11 border-2 border-slate-100 shadow-sm">
                                                    <AvatarImage src={recruiter.avatar || undefined} />
                                                    <AvatarFallback className="bg-[#f1f5f9] text-slate-600 font-black text-sm">
                                                        {recruiter.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{recruiter.name}</p>
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                        <Mail className="w-3 h-3" />
                                                        {recruiter.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className={`
                                                    font-bold rounded-lg px-2.5 py-1 flex gap-1.5 items-center
                                                    ${recruiter.role === 'Admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}
                                                `}>
                                                    <Shield className="w-3 h-3" />
                                                    {recruiter.role}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${recruiter.isActive ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`} />
                                                <span className={`text-sm font-bold ${recruiter.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {recruiter.isActive ? 'Online' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-all">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Manage Access</DropdownMenuLabel>
                                                    <DropdownMenuItem className="rounded-xl font-bold py-2.5 cursor-pointer flex gap-2">
                                                        <Shield className="w-4 h-4" /> Edit Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl font-bold py-2.5 cursor-pointer flex gap-2">
                                                        <Fingerprint className="w-4 h-4" /> Reset Credentials
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 my-1.5" />
                                                    <DropdownMenuItem className="rounded-xl font-bold py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 flex gap-2">
                                                        <UserMinus className="w-4 h-4" /> Deactivate Member
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
