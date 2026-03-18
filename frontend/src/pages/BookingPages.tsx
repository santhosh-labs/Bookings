import { useState } from "react";
import { 
    Plus, 
    Globe, 
    ExternalLink, 
    Copy, 
    MoreHorizontal, 
    Loader2, 
    Search, 
    Share2, 
    Palette, 
    HelpCircle, 
    ChevronRight,
    Users,
    Briefcase,
    Building2,
    CalendarCheck,
    CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useServices } from "../hooks/use-services";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useAuth } from "../hooks/use-auth";
import { useRecruiters } from "../hooks/use-recruiters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ShareServiceModal from "../components/modals/ShareServiceModal";

export default function BookingPages() {
    const { currentWorkspace, workspaces } = useWorkspace();
    const { user } = useAuth();
    const { data: services = [], isLoading: servicesLoading } = useServices(currentWorkspace?.id);
    const { data: recruiters = [], isLoading: recruitersLoading } = useRecruiters(currentWorkspace?.id);
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("interviews");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedServiceForShare, setSelectedServiceForShare] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRecruiters = recruiters.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredWorkspaces = workspaces.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopyPageUrl = () => {
        const url = `${window.location.origin}/book/${currentWorkspace?.slug || currentWorkspace?.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (service: any) => {
        setSelectedServiceForShare(service);
        setShareModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Booking Pages</h1>
                <Button variant="ghost" size="icon" className="text-slate-400">
                    <HelpCircle className="w-5 h-5" />
                </Button>
            </div>

            {/* Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Avatar className="w-16 h-16 border-2 border-slate-100 shadow-sm">
                            <AvatarImage src={user?.avatar || undefined} />
                            <AvatarFallback className="bg-indigo-50 text-[#5E48B8] font-black text-xl">
                                {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-slate-900">{user?.name || "Administrator"}</h2>
                                <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] py-0 px-2 h-5">PRO</Badge>
                            </div>
                            <p className="text-slate-500 font-medium">{user?.email || "admin@example.com"}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to={`/book/${currentWorkspace?.slug || currentWorkspace?.id}`} target="_blank">
                            <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 hover:bg-slate-50 gap-2 shadow-sm">
                                <ExternalLink className="w-4 h-4" />
                                Open Page
                            </Button>
                        </Link>
                        <Button 
                            variant="outline" 
                            onClick={handleCopyPageUrl}
                            className="h-11 rounded-xl font-bold border-slate-200 hover:bg-slate-50 gap-2 shadow-sm"
                        >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                            {copied ? "Link Copied" : "Share Page"}
                        </Button>
                        <Link to="/themes-and-layouts">
                            <Button className="h-11 rounded-xl font-bold bg-[#5E48B8] hover:bg-[#4C3A96] text-white gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                                <Palette className="w-4 h-4" />
                                Themes and Layouts
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <div className="px-8 pb-6">
                    <p className="text-sm text-slate-500 font-medium italic opacity-80">
                        This is your unique booking page. It lists all the interviews you offer in <strong>{currentWorkspace?.name}</strong>.
                    </p>
                </div>

                {/* Tabs */}
                <div className="px-8 border-t border-slate-100">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="h-14 bg-transparent border-none p-0 gap-8">
                            <TabsTrigger 
                                value="interviews" 
                                className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-[#5E48B8] data-[state=active]:bg-transparent data-[state=active]:text-[#5E48B8] px-0 font-bold text-slate-500"
                            >
                                Interviews
                            </TabsTrigger>
                            <TabsTrigger 
                                value="recruiters" 
                                className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-[#5E48B8] data-[state=active]:bg-transparent data-[state=active]:text-[#5E48B8] px-0 font-bold text-slate-500"
                            >
                                Recruiters
                            </TabsTrigger>
                            {currentWorkspace === null && (
                                <TabsTrigger 
                                    value="workspaces" 
                                    className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-[#5E48B8] data-[state=active]:bg-transparent data-[state=active]:text-[#5E48B8] px-0 font-bold text-slate-500"
                                >
                                    Workspaces
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <div className="py-6 border-t border-slate-100 space-y-6 min-h-[400px]">
                            {/* Search */}
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder={`Search ${activeTab}...`} 
                                    className="pl-10 h-10 bg-white border-slate-200 rounded-xl focus:border-[#5E48B8] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Interviews Content */}
                            <TabsContent value="interviews" className="m-0 focus-visible:outline-none">
                                <div className="space-y-3">
                                    {servicesLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Interviews</p>
                                        </div>
                                    ) : filteredServices.length > 0 ? (
                                        filteredServices.map((service) => (
                                            <div 
                                                key={service.id} 
                                                onClick={() => navigate(`/booking-pages/${service.id}?tab=analytics`)}
                                                className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-slate-200 hover:shadow-md hover:shadow-indigo-50/50 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                                        {service.image ? (
                                                            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            service.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link to={`/booking-pages/${service.id}?tab=analytics`} className="font-bold text-slate-900 group-hover:text-[#5E48B8] transition-colors" onClick={(e) => e.stopPropagation()}>
                                                            {service.name}
                                                        </Link>
                                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                            {service.duration} mins | {service.category || 'One-on-One'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleShare(service)}
                                                        className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#5E48B8] hover:bg-indigo-50"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                    </Button>
                                                    <Link to={`/booking-pages/${service.id}`}>
                                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState icon={CalendarCheck} title="No interviews found" subtitle={searchTerm ? "Try adjusting your search filters" : "Start by creating your first interview type"} />
                                    )}
                                </div>
                            </TabsContent>

                            {/* Recruiters Content */}
                            <TabsContent value="recruiters" className="m-0 focus-visible:outline-none">
                                <div className="space-y-3">
                                    {recruitersLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Team</p>
                                        </div>
                                    ) : filteredRecruiters.length > 0 ? (
                                        filteredRecruiters.map((recruiter) => (
                                            <div key={recruiter.id} className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-12 h-12 border border-slate-100 shadow-sm">
                                                        <AvatarImage src={recruiter.avatar || undefined} />
                                                        <AvatarFallback className="bg-slate-50 text-slate-600 font-bold">
                                                            {recruiter.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{recruiter.name}</h3>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {recruiter.role} | {recruiter.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link to={`/recruiters`}>
                                                    <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 gap-2">
                                                        View Profile
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState icon={Users} title="No recruiters found" subtitle="Invite team members to see them here" />
                                    )}
                                </div>
                            </TabsContent>

                            {/* Workspaces Content */}
                            <TabsContent value="workspaces" className="m-0 focus-visible:outline-none">
                                <div className="space-y-3">
                                    {filteredWorkspaces.length > 0 ? (
                                        filteredWorkspaces.map((workspace) => (
                                            <div key={workspace.id} className={`group flex items-center justify-between p-5 bg-white border rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${workspace.id === currentWorkspace?.id ? 'border-[#5E48B8] ring-1 ring-[#5E48B8]/20 shadow-indigo-50 shadow-lg' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${workspace.id === currentWorkspace?.id ? 'bg-[#5E48B8] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        {workspace.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-slate-900">{workspace.name}</h3>
                                                            {workspace.id === currentWorkspace?.id && <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] py-0 px-1.5 h-4 uppercase tracking-tighter">Current</Badge>}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium">/{workspace.slug}</p>
                                                    </div>
                                                </div>
                                                <Link to="/settings">
                                                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100">
                                                        <Settings2 className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState icon={Building2} title="No workspaces found" subtitle="You haven't joined any other workspaces yet" />
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            <ShareServiceModal 
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                service={selectedServiceForShare}
            />
        </div>
    );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
    return (
        <div className="py-20 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center px-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <Icon className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1 max-w-[280px]">
                {subtitle}
            </p>
        </div>
    );
}

function Settings2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  )
}
