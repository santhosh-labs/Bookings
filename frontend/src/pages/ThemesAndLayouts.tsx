import { useState, useEffect } from "react";
import { 
    ChevronLeft, 
    Save, 
    Upload, 
    Eye, 
    ChevronRight, 
    Image as ImageIcon,
    Layout,
    Type,
    Check,
    Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from "@/components/ui/accordion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { BookingContent } from "./PublicBooking";
import { useServices } from "../hooks/use-services";

const PRESET_COLORS = [
    "#4B4376", "#FF4C4C", "#A287E8", "#2CC9D1", "#22C55E", "#7C6A8C", "#B3135A",
    "#2E3192", "#388E3C", "#C16B1B", "#F57C00", "linear-gradient(45deg, #A855F7, #EC4899)",
    "linear-gradient(45deg, #EF4444, #F97316)", "linear-gradient(45deg, #FACC15, #111827)",
    "linear-gradient(45deg, #FACC15, #386A6A)", "linear-gradient(45deg, #FACC15, #1E3A8A)",
    "linear-gradient(45deg, #FACC15, #2563EB)", "linear-gradient(45deg, #9333EA, #3B82F6)",
    "linear-gradient(45deg, #DB2777, #111827)", "linear-gradient(45deg, #E11D48, #4B2C20)",
    "linear-gradient(45deg, #FFFFFF, #E11D48)"
];

const PREVIEW_SERVICES = [
    {
        id: "preview-1",
        name: "Initial Consultation",
        duration: 30,
        price: 50,
        color: "#4B4376",
        isActive: true,
        staffIds: [1]
    },
    {
        id: "preview-2",
        name: "Project Review",
        duration: 60,
        price: 120,
        color: "#FF4C4C",
        isActive: true,
        staffIds: [1]
    }
];

export default function ThemesAndLayouts() {
    const { currentWorkspace } = useWorkspace();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { data: workspaceServices = [] } = useServices(currentWorkspace?.id ?? null);
    
    const [theme, setTheme] = useState({
        primaryColor: (currentWorkspace as any)?.theme?.primaryColor || "#4B4376",
        backgroundUrl: "/default-bg.png",
        logoUrl: (currentWorkspace as any)?.theme?.logoUrl || "",
        headerTitle: (currentWorkspace as any)?.theme?.headerTitle || currentWorkspace?.name || "Administrator",
        showHeader: (currentWorkspace as any)?.theme?.showHeader ?? true,
    });

    useEffect(() => {
        if (currentWorkspace) {
            setTheme({
                primaryColor: (currentWorkspace as any)?.theme?.primaryColor || "#4B4376",
                backgroundUrl: "/default-bg.png",
                logoUrl: (currentWorkspace as any)?.theme?.logoUrl || "",
                headerTitle: (currentWorkspace as any)?.theme?.headerTitle || currentWorkspace.name || "Administrator",
                showHeader: (currentWorkspace as any)?.theme?.showHeader ?? true,
            });
        }
    }, [currentWorkspace]);

    const mutation = useMutation({
        mutationFn: async (updatedTheme: any) => {
            const res = await apiRequest("PATCH", `/api/workspaces/${currentWorkspace?.id}`, { theme: updatedTheme });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
            toast({
                title: "Theme Updated",
                description: "Your booking page branding has been successfully saved.",
            });
            navigate(-1);
        }
    });

    const handleSave = () => {
        if (!currentWorkspace?.id) return;
        mutation.mutate(theme);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 flex flex-col z-50 overflow-hidden animate-in fade-in duration-500 font-sans">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Themes and Layouts</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">Customizing Booking Page</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleSave} 
                        disabled={mutation.isPending || !currentWorkspace?.id}
                        className="bg-[#5E48B8] hover:bg-[#4C3A96] text-white font-black px-8 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex gap-2 disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Real-time Preview */}
                <div className="flex-1 bg-slate-100/50 p-12 overflow-y-auto flex flex-col items-center">
                    <div className="w-full max-w-[850px] mb-6 flex items-center justify-between">
                        <Badge className="bg-white text-slate-400 border-slate-200 font-bold px-3 py-1 shadow-sm">LIVE PREVIEW</Badge>
                        <div className="flex gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                             <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                             <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                    </div>
                    
                    <div 
                        className="w-full max-w-[850px] aspect-[4/3] min-h-[700px] border-4 border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden bg-white relative group transition-all duration-700"
                        style={{ 
                            backgroundColor: '#F8FAFC'
                        }}
                    >
                        {/* Live Booking Content Overlay */}
                        <div className="absolute inset-0 overflow-y-auto">
                            <BookingContent 
                                theme={theme} 
                                services={workspaceServices.length > 0 ? workspaceServices : PREVIEW_SERVICES} 
                                previewMode={true} 
                            />
                        </div>
                        
                        {/* Visual hints of being a preview */}
                        <div className="absolute inset-x-0 bottom-0 py-2 bg-white/40 backdrop-blur-md border-t border-white/20 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                            Interactive Preview Selection
                        </div>
                    </div>
                </div>

                {/* Right Side: Editor Panel */}
                <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col overflow-y-auto relative z-10 shadow-2xl">
                    <div className="p-8 space-y-10">
                        {/* Section: Brand Colors */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black text-slate-700 uppercase tracking-widest">Brand Colors</Label>
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">PRIMARY</span>
                            </div>
                            <div className="grid grid-cols-7 gap-3">
                                {PRESET_COLORS.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTheme({ ...theme, primaryColor: color })}
                                        className={`w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${theme.primaryColor === color ? 'border-slate-900 shadow-lg' : 'border-transparent shadow-sm'}`}
                                        style={{ background: color }}
                                    >
                                        {theme.primaryColor === color && <Check className={`w-4 h-4 ${color.includes('FFFFFF') ? 'text-slate-900' : 'text-white'}`} />}
                                    </button>
                                ))}
                                <div className="col-span-1">
                                    <button className="w-9 h-9 rounded-xl border-2 border-slate-100 flex items-center justify-center bg-slate-50 text-slate-400 hover:border-slate-300 transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>




                        {/* Collapsible Sections */}
                        <Accordion type="single" collapsible className="w-full border-t border-slate-100">
                            <AccordionItem value="header" className="border-b border-slate-100">
                                <AccordionTrigger className="hover:no-underline py-6">
                                    <div className="flex items-center gap-3 text-slate-900 font-black tracking-tight">
                                        <Layout className="w-5 h-5 text-slate-400" />
                                        Header Settings
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 space-y-6 px-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-slate-600">Show Header</Label>
                                        <input 
                                            type="checkbox" 
                                            checked={theme.showHeader}
                                            onChange={(e) => setTheme({...theme, showHeader: e.target.checked})}
                                            className="w-10 h-5 rounded-full bg-slate-200 appearance-none checked:bg-emerald-500 transition-all cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-5"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page Title</Label>
                                            <Eye className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <Input 
                                            value={theme.headerTitle}
                                            onChange={(e) => setTheme({ ...theme, headerTitle: e.target.value })}
                                            className="h-12 bg-white border-slate-200 rounded-xl font-medium" 
                                            placeholder="Enter your title"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logo</Label>
                                            <Eye className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-12">
                                            <Input 
                                                value={theme.logoUrl}
                                                onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value })}
                                                placeholder="Upload Logo"
                                                className="border-none bg-white font-medium focus-visible:ring-0 shadow-none h-full" 
                                            />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                id="logo-upload" 
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append("image", file);
                                                    try {
                                                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                        const data = await res.json();
                                                        setTheme({ ...theme, logoUrl: data.url });
                                                        toast({ title: "Logo uploaded" });
                                                    } catch (err) {
                                                        toast({ title: "Upload failed", variant: "destructive" });
                                                    }
                                                }}
                                            />
                                            <button 
                                                type="button"
                                                className="px-4 border-l border-slate-200 h-full flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="typography" className="border-b border-slate-100">
                                <AccordionTrigger className="hover:no-underline py-6">
                                    <div className="flex items-center gap-3 text-slate-900 font-black tracking-tight">
                                        <Type className="w-5 h-5 text-slate-400" />
                                        Typography
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <p className="text-sm text-slate-500">Coming soon in the next update.</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </aside>
            </div>
        </div>
    );
}
