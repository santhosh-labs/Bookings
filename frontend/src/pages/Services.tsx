import { useState } from "react";
import { Plus, Search, ChevronDown, Grid, List, Share, User, Clock, Trash2, Edit2, Loader2 } from "lucide-react";
import CreateServiceModal from "../components/modals/CreateServiceModal";
import ShareServiceModal from "../components/modals/ShareServiceModal";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useServices, useDeleteService } from "../hooks/use-services";
import { useRecruiters } from "../hooks/use-recruiters";
import { Button } from "@/components/ui/button";
import { Service } from "@shared/schema";
import { useNavigate } from "react-router-dom";

export default function Services() {
    const { currentWorkspace, workspaces } = useWorkspace();
    const { data: services = [], isLoading, refresh } = useServices(currentWorkspace?.id ?? null);
    const { data: recruiters = [] } = useRecruiters(currentWorkspace?.id ?? null);
    const deleteServiceMutation = useDeleteService();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const gradients: Record<string, string> = {
        emerald: "from-emerald-500/10 to-teal-500/10",
        violet: "from-violet-500/10 to-purple-500/10",
        amber: "from-amber-500/10 to-orange-500/10",
        rose: "from-rose-500/10 to-red-500/10",
        blue: "from-blue-500/10 to-indigo-500/10",
        indigo: "from-indigo-500/10 to-blue-500/10",
    };

    const bgColors: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };

    if (workspaces.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground drop-shadow-md">No Workspaces Found</h2>
                <p className="text-foreground/70 text-lg font-medium">Please create a workspace to view its services.</p>
            </div>
        );
    }

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this service?")) {
            await deleteServiceMutation.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-8 relative z-10 w-full animate-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center cursor-pointer group">
                        Active Services
                        <span className="ml-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-black shadow-lg shadow-primary/20 transition-transform">{filteredServices.length}</span>
                        <ChevronDown className="w-6 h-6 text-muted-foreground ml-2 group-hover:text-primary transition-colors" />
                    </h1>
                </div>

                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                    <div className="relative group flex items-center flex-1 sm:flex-none">
                        <Search className="w-5 h-5 text-muted-foreground absolute left-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-base font-semibold text-slate-800 outline-none transition-all w-full sm:w-64 shadow-sm placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
                        <button className="p-2 bg-slate-50 shadow-inner text-slate-800 rounded-lg transition-transform border border-slate-200">
                            <Grid className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-800 rounded-lg transition-all hover:bg-slate-50">
                            <List className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all text-base flex items-center justify-center gap-3 shrink-0 hover:-translate-y-0.5 w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5 stroke-[3px]" />
                        New Service
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                    {filteredServices.map(service => (
                        <div 
                            key={service.id} 
                            onClick={() => navigate(`/booking-pages/${service.id}`)}
                            className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col cursor-pointer group relative shadow-md"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="p-6 flex items-start gap-5 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm border overflow-hidden ${service.color && bgColors[service.color] ? bgColors[service.color] : 'bg-primary/10 text-primary border-primary/20'}`}>
                                    {service.image ? (
                                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                    ) : (
                                        service.name.substring(0, 2).toUpperCase()
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-primary transition-colors">{service.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-2 uppercase tracking-tight">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">{service.duration} mins</span>
                                        <span className="text-slate-200">|</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">{service.category || "General"}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/booking-pages/${service.id}`); }}
                                    >
                                        <Edit2 className="w-4 h-4 text-slate-400" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg hover:text-rose-600"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between mt-auto bg-white/50 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {Array.isArray(service.staffIds) && (service.staffIds as number[]).length > 0 ? (
                                            (service.staffIds as number[]).map((id: number) => {
                                                const r = recruiters.find(rec => rec.id === id);
                                                if (!r) return null;
                                                return (
                                                    <div key={id} className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-sm" title={r.name}>
                                                        {r.avatar ? (
                                                            <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                                                                {r.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-300">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[120px]">
                                        {Array.isArray(service.staffIds) && (service.staffIds as number[]).length > 0 
                                            ? recruiters.find(r => r.id === (service.staffIds as number[])[0])?.name || "Shared"
                                            : "No Assignee"}
                                    </span>
                                </div>

                                 <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedService(service);
                                        setShareModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                >
                                    <Share className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredServices.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 mt-4 shadow-sm flex flex-col items-center">
                            <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6 border border-primary/10 shadow-inner">
                                <List className="w-10 h-10 text-primary opacity-50" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Services Added</h2>
                            <p className="text-slate-500 mb-8 text-base max-w-md mx-auto font-medium">Add Services to create different appointment categories with their own unique duration and settings.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all text-base inline-flex items-center justify-center gap-3 hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5 stroke-[3px]" />
                                New Service
                            </button>
                        </div>
                    )}
                </div>
            )}

            <CreateServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workspaceId={currentWorkspace?.id}
                onSuccess={refresh}
            />

            <ShareServiceModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                service={selectedService}
            />
        </div>
    );
}
