import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
    ChevronLeft, 
    Share2, 
    X,
    MoreHorizontal,
    CheckCircle2,
    Copy,
    ExternalLink,
    Loader2,
    Calendar,
    Users,
    Clock,
    Shield,
    Bell,
    FileText,
    Info,
    Search,
    UserPlus,
    Video,
    CreditCard,
    Save,
    Settings as SettingsIcon,
    ArrowUpRight,
    MapPin,
    Monitor,
    Hash,
    Plus, 
    Minus, 
    Globe,
    Image as ImageIcon
} from "lucide-react";
import { useServices, useUpdateService } from "../hooks/use-services";
import { useRecruiters } from "../hooks/use-recruiters";
import { useBookings } from "../hooks/use-bookings";
import { useDashboardStats } from "../hooks/use-dashboard";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Calendar as CalendarIcon, List as ListIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const SECTIONS = [
    { id: "analytics", label: "Analytics & Data", icon: BarChart3 },
    { id: "details", label: "Interview Details", icon: Video },
    { id: "recruiters", label: "Assigned Recruiters", icon: Users },
    { id: "availability", label: "Interview Availability", icon: Calendar },
    { id: "scheduling", label: "Scheduling Rules", icon: Clock },
    { id: "notifications", label: "Notification Preferences", icon: Bell },
    { id: "form", label: "Booking Form", icon: FileText },
];

export default function BookingPageDetail() {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { currentWorkspace } = useWorkspace();
    const { data: services = [], isLoading: servicesLoading } = useServices(currentWorkspace?.id);
    const { data: recruiters = [], isLoading: recruitersLoading } = useRecruiters(currentWorkspace?.id);
    const updateService = useUpdateService();
    
    const service = services.find(s => s.id === Number(serviceId));
    
    const queryParams = new URLSearchParams(window.location.search);
    const [activeSection, setActiveSection] = useState(queryParams.get("tab") || "analytics");
    const [formData, setFormData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [copied, setCopied] = useState(false);

    const { data: stats, isLoading: statsLoading } = useDashboardStats(currentWorkspace?.id, Number(serviceId));
    const { data: serviceBookings = [], isLoading: bookingsLoading } = useBookings(currentWorkspace?.id, Number(serviceId));

    // Calculate real chart data from actual bookings
    const chartData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => {
        const count = serviceBookings.filter((b: any) => {
            const date = new Date(b.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' }) === day;
        }).length;
        return { name: day, bookings: count };
    });

    // Reorder to start from Monday (or however you prefer)
    const sortedChartData = [...chartData.slice(1), chartData[0]];

    useEffect(() => {
        if (service && !formData) {
            const defaultBookingForm = [
                { id: "name", label: "Full Name", required: true, type: "text" },
                { id: "email", label: "Email Address", required: true, type: "email" }
            ];

            const defaultSchedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].reduce((acc, day) => ({
                ...acc,
                [day]: { enabled: day !== "Saturday" && day !== "Sunday", startTime: "09:00", endTime: "17:00" }
            }), {});

            setFormData({
                name: service.name,
                description: service.description || "",
                duration: service.duration,
                category: service.category || "one-on-one",
                price: service.price || 0,
                priceType: service.price > 0 ? "Paid" : "Free",
                location: service.location || "Online Meeting",
                isActive: service.isActive ?? true,
                staffIds: service.staffIds || [],
                image: service.image || "",
                settings: {
                    scheduling: {
                        bufferBefore: service.settings?.scheduling?.bufferBefore ?? 15,
                        bufferAfter: service.settings?.scheduling?.bufferAfter ?? 15,
                        minimumNotice: service.settings?.scheduling?.minimumNotice ?? 24,
                        timeIncrements: service.settings?.scheduling?.timeIncrements ?? 30,
                        dateRange: service.settings?.scheduling?.dateRange ?? "60",
                        maxBookingsPerDay: service.settings?.scheduling?.maxBookingsPerDay ?? ""
                    },
                    availability: {
                        type: service.settings?.availability?.type || "indefinite",
                        range: service.settings?.availability?.range || 60,
                        schedule: service.settings?.availability?.schedule || defaultSchedule
                    },
                    notifications: {
                        emailConfirmation: service.settings?.notifications?.emailConfirmation ?? true,
                        reminders: service.settings?.notifications?.reminders ?? true,
                        cancellationPolicy: service.settings?.notifications?.cancellationPolicy ?? true,
                        reschedulePolicy: service.settings?.notifications?.reschedulePolicy ?? true
                    },
                    bookingForm: service.settings?.bookingForm || defaultBookingForm
                }
            });
        }
    }, [service, formData]);

    const handleSave = async () => {
        if (!serviceId || !formData) return;
        
        try {
            await updateService.mutateAsync({
                id: Number(serviceId),
                name: formData.name,
                description: formData.description,
                duration: Number(formData.duration),
                category: formData.category,
                price: formData.priceType === "Paid" ? Number(formData.price) : 0,
                location: formData.location,
                isActive: formData.isActive,
                staffIds: formData.staffIds,
                image: formData.image,
                settings: formData.settings
            });
            
            toast({
                title: "Changes Saved",
                description: "Your interview settings have been updated successfully.",
            });
            navigate("/booking-pages");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save changes. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/book/s/${serviceId}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });
            const data = await res.json();
            setFormData({ ...formData, image: data.url });
            toast({ title: "Image updated successfully" });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({ title: "Upload failed", variant: "destructive" });
        }
    };


    if (servicesLoading || !formData) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5E48B8]" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Configuration</p>
                </div>
            </div>
        );
    }

    const toggleRecruiter = (recruiterId: number) => {
        const currentIds = [...formData.staffIds];
        const index = currentIds.indexOf(recruiterId);
        if (index > -1) {
            currentIds.splice(index, 1);
        } else {
            currentIds.push(recruiterId);
        }
        setFormData({ ...formData, staffIds: currentIds });
    };

    const updateScheduling = (key: string, value: any) => {
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                scheduling: {
                    ...formData.settings.scheduling,
                    [key]: value
                }
            }
        });
    };

    const updateAvailability = (day: string, updates: any) => {
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                availability: {
                    ...formData.settings.availability,
                    schedule: {
                        ...formData.settings.availability.schedule,
                        [day]: {
                            ...formData.settings.availability.schedule[day],
                            ...updates
                        }
                    }
                }
            }
        });
    };

    const updateNotifications = (key: string, value: boolean) => {
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                notifications: {
                    ...formData.settings.notifications,
                    [key]: value
                }
            }
        });
    };

    const addFormField = () => {
        const newField = { 
            id: `field_${Date.now()}`, 
            label: "New Question", 
            required: false, 
            type: "text" 
        };
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                bookingForm: [...formData.settings.bookingForm, newField]
            }
        });
    };

    const updateFormField = (id: string, updates: any) => {
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                bookingForm: (formData.settings.bookingForm || []).map((f: any) => 
                    f.id === id ? { ...f, ...updates } : f
                )
            }
        });
    };

    const removeFormField = (id: string) => {
        if (id === "name" || id === "email") return; // Keep core fields
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                bookingForm: formData.settings.bookingForm.filter((f: any) => f.id !== id)
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col z-[100] animate-in fade-in duration-500 overflow-hidden font-sans">
            {/* Header Area */}
            <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5E48B8] flex items-center justify-center font-black text-base shadow-sm border border-indigo-100/50 overflow-hidden">
                        {formData.image ? (
                            <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
                        ) : (
                            formData.name.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">{formData.name}</h1>
                            <Badge className={`${formData.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"} border-none font-bold text-[9px] h-4 px-2 uppercase tracking-tight`}>
                                {formData.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                             One-on-One Session <span className="text-slate-200">|</span> {formData.duration} mins
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={handleCopy} variant="outline" className="h-9 rounded-lg border-slate-200 font-bold gap-2 px-4 text-xs hover:bg-slate-50">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                        {copied ? "Copied" : "Share"}
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={updateService.isPending}
                        className="h-9 rounded-lg bg-slate-900 hover:bg-black text-white font-bold gap-2 px-5 text-xs shadow-lg shadow-slate-200"
                    >
                        {updateService.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {updateService.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <div className="w-px h-6 bg-slate-100 mx-1" />
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-300 hover:text-slate-600" onClick={() => navigate("/booking-pages")}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Fixed Sidebar Navigation */}
                <aside className="w-[280px] bg-slate-50/50 border-r border-slate-100 flex flex-col pt-8 px-4 shrink-0 h-full overflow-y-auto">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`
                                flex items-center gap-3 w-full px-4 py-3 rounded-xl mb-1.5 transition-all group
                                ${activeSection === section.id 
                                    ? "bg-white text-slate-900 shadow-md shadow-indigo-100/50 border border-slate-200/50" 
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center transition-all
                                ${activeSection === section.id ? "bg-[#5E48B8] text-white shadow-sm shadow-indigo-100" : "bg-slate-100/50 text-slate-300 group-hover:text-slate-500"}
                            `}>
                                <section.icon size={16} />
                            </div>
                            <span className={`text-[13px] font-bold tracking-tight ${activeSection === section.id ? "text-slate-800" : "text-slate-500"}`}>
                                {section.label}
                            </span>
                        </button>
                    ))}
                    
                    <div className="mt-auto pb-8 px-4">
                        <div className="bg-[#5E48B8]/5 border border-indigo-100/50 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:bg-[#5E48B8]/10 transition-colors cursor-pointer">
                            <Info className="w-4 h-4 text-[#5E48B8]" />
                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">Need help? Read documentation or contact support.</p>
                            <ArrowUpRight className="absolute bottom-3 right-3 w-3.5 h-3.5 text-[#5E48B8] opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-white p-12 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl"
                        >
                            {activeSection === "analytics" && (
                                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Data & Performance</h2>
                                        <p className="text-slate-500 font-medium text-sm">Real-time engagement metrics for this specific interview type.</p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/20 transition-all group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <CalendarIcon className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bookings</span>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-black text-slate-900">{statsLoading ? "..." : stats?.totalBookings || 0}</span>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] mb-1.5 flex items-center h-5">
                                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                                    Active
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/20 transition-all group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <DollarSign className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</span>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-black text-slate-900">${statsLoading ? "..." : (stats?.revenue || 0).toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-slate-400 mb-1.5 ml-1">USD</span>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/20 transition-all group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completion Rate</span>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-black text-slate-900">94%</span>
                                                <span className="text-[10px] font-bold text-emerald-500 mb-1.5 flex items-center">
                                                    Excellent
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart */}
                                    <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 min-h-[400px]">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Booking Velocity</h3>
                                                <p className="text-xs text-slate-400 font-medium">Daily distribution of new appointments.</p>
                                            </div>
                                            <Select defaultValue="7d">
                                                <SelectTrigger className="w-32 h-9 bg-white rounded-xl border-slate-200 text-xs font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="7d">Last 7 Days</SelectItem>
                                                    <SelectItem value="30d">Last 30 Days</SelectItem>
                                                    <SelectItem value="all">All Time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={sortedChartData}>
                                                    <defs>
                                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#5E48B8" stopOpacity={0.1}/>
                                                            <stop offset="95%" stopColor="#5E48B8" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                        dy={10}
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ 
                                                            borderRadius: '16px', 
                                                            border: 'none', 
                                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                            padding: '12px 16px'
                                                        }} 
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="bookings" 
                                                        stroke="#5E48B8" 
                                                        strokeWidth={4}
                                                        fillOpacity={1} 
                                                        fill="url(#colorBookings)" 
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Recent Activity Table */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Event Log</h3>
                                            <Link to="/bookings" className="text-xs font-black uppercase tracking-widest text-[#5E48B8] hover:underline">View All Bookings</Link>
                                        </div>
                                        
                                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                        <th className="px-6 py-4">Attendee</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4 text-right">Date & Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {bookingsLoading ? (
                                                        [1,2,3].map(i => (
                                                            <tr key={i} className="animate-pulse">
                                                                <td colSpan={3} className="px-6 py-4 h-16 bg-slate-50/20" />
                                                            </tr>
                                                        ))
                                                    ) : serviceBookings.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">No bookings recorded for this event yet.</td>
                                                        </tr>
                                                    ) : (
                                                        serviceBookings.slice(0, 5).map((booking: any) => (
                                                            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#5E48B8] flex items-center justify-center font-bold text-[10px]">
                                                                            {booking.customerName.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-slate-800">{booking.customerName}</p>
                                                                            <p className="text-[10px] text-slate-400">{booking.customerEmail}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge className={`
                                                                        border-none font-black text-[9px] py-0 px-2 h-5 uppercase tracking-tighter
                                                                        ${booking.status === "Upcoming" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}
                                                                    `}>
                                                                        {booking.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <p className="text-xs font-bold text-slate-700">{format(new Date(booking.date), "MMM d, yyyy")}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium">{booking.time}</p>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === "details" && (
                                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Details</h2>
                                        <p className="text-slate-500 font-medium text-sm">Set the fundamental details for your interview offering.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Image</Label>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group/img transition-all hover:border-indigo-600/30">
                                                        {formData.image ? (
                                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="w-8 h-8 text-slate-300" />
                                                        )}
                                                        <div 
                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                                                            onClick={() => document.getElementById('event-detail-image')?.click()}
                                                        >
                                                            <Plus className="w-6 h-6 text-white" />
                                                        </div>
                                                        <input 
                                                            type="file" 
                                                            id="event-detail-image" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-700">Display Picture</p>
                                                        <p className="text-xs font-medium text-slate-400">Click to upload or drag image</p>
                                                        {formData.image && (
                                                            <button 
                                                                onClick={() => setFormData({ ...formData, image: "" })}
                                                                className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Name</Label>
                                                 <Input 
                                                     value={formData.name ?? ""}
                                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                     placeholder="e.g. Technical Interview"
                                                     className="h-12 bg-slate-50/50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all shadow-sm"
                                                 />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Link</Label>
                                                <div className="flex items-center gap-2 h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-4 overflow-hidden group focus-within:ring-4 focus-within:ring-indigo-600/5 focus-within:border-indigo-600/30 transition-all shadow-sm">
                                                    <span className="text-slate-400 font-bold text-xs select-none">book.it/</span>
                                                    <input 
                                                        value={serviceId ?? ""}
                                                        readOnly
                                                        className="flex-1 bg-transparent font-bold text-slate-700 outline-none h-full text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 flex flex-col">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</Label>
                                             <Textarea 
                                                 value={formData.description ?? ""}
                                                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                 placeholder="Enter event details here..."
                                                 className="flex-1 min-h-[140px] bg-slate-50/50 border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-600 leading-relaxed outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all shadow-sm"
                                             />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-slate-100">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Duration</Label>
                                            <div className="relative group">
                                                <Select 
                                                    value={(formData.duration ?? 30).toString()} 
                                                    onValueChange={(val) => setFormData({ ...formData, duration: Number(val) })}
                                                >
                                                    <SelectTrigger className="h-12 bg-slate-50/50 border-slate-100 rounded-xl px-4 font-bold text-slate-700 shadow-none text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="15">15 Minutes</SelectItem>
                                                        <SelectItem value="30">30 Minutes</SelectItem>
                                                        <SelectItem value="45">45 Minutes</SelectItem>
                                                        <SelectItem value="60">60 Minutes</SelectItem>
                                                        <SelectItem value="90">90 Minutes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</Label>
                                            <Select 
                                                value={formData.location ?? "Online Meeting"}
                                                onValueChange={(val) => setFormData({ ...formData, location: val })}
                                            >
                                                <SelectTrigger className="h-12 bg-slate-50/50 border-slate-100 rounded-xl px-4 font-bold text-slate-700 shadow-none text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="Online Meeting">Video Call (Default)</SelectItem>
                                                    <SelectItem value="In Person">In Person</SelectItem>
                                                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                                                    <SelectItem value="Zoom">Zoom Meeting</SelectItem>
                                                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Pricing</Label>
                                            <div className="flex gap-2 h-12">
                                                <div className="flex bg-slate-100/50 p-1 rounded-lg w-full">
                                                    {["Free", "Paid"].map(p => (
                                                        <button
                                                            key={p}
                                                            onClick={() => setFormData({ ...formData, priceType: p })}
                                                            className={`flex-1 rounded-md text-[10px] font-black uppercase tracking-[0.05em] transition-all ${formData.priceType === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                                {formData.priceType === "Paid" && (
                                                    <div className="flex-1 flex items-center bg-slate-50/50 border border-slate-100 rounded-lg px-3 animate-in fade-in transition-all shadow-sm">
                                                        <span className="text-slate-400 font-bold mr-1.5 text-xs">₹</span>
                                                        <input 
                                                            type="number"
                                                            value={formData.price ?? 0}
                                                            onChange={(e) => setFormData({ ...formData, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                                                            className="w-full bg-transparent font-black text-slate-700 outline-none text-xs"
                                                         />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}                             {activeSection === "recruiters" && (
                                 <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
                                     <div className="flex justify-between items-end">
                                         <div className="space-y-1">
                                             <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Recruiters</h2>
                                             <p className="text-slate-500 font-medium text-sm">Assign recruiters who are authorized to offer this event.</p>
                                         </div>
                                         <Button 
                                             onClick={() => navigate("/staff")}
                                             className="h-10 rounded-lg bg-slate-900 text-white font-bold gap-2 px-5 text-sm shadow-lg shadow-slate-200"
                                         >
                                             <UserPlus className="w-4 h-4" />
                                             Add Recruiter
                                         </Button>
                                     </div>

                                     <div className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                         <div className="p-6 border-b border-white bg-white/40 flex items-center justify-between gap-6">
                                             <div className="relative max-w-sm w-full">
                                                 <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                  <Input 
                                                      value={searchTerm ?? ""}
                                                      onChange={(e) => setSearchTerm(e.target.value)}
                                                      placeholder="Search by name or email..." 
                                                      className="pl-11 h-10 bg-white/80 border-slate-100 rounded-xl font-bold text-xs shadow-inner"
                                                  />
                                             </div>
                                             <Badge variant="outline" className="bg-white text-slate-400 border-slate-100 font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-widest leading-none">
                                                 {formData.staffIds.length} Assigned
                                             </Badge>
                                         </div>

                                         <div className="p-4 overflow-y-auto max-h-[500px] space-y-2 custom-scrollbar">
                                             {recruitersLoading ? (
                                                 <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                                                     <Loader2 className="w-10 h-10 animate-spin" />
                                                     <p className="font-bold text-xs uppercase tracking-widest">Fetching Recruiters</p>
                                                 </div>
                                             ) : recruiters.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                                 <div className="py-20 text-center space-y-4">
                                                     <div className="w-16 h-16 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center mx-auto text-slate-200">
                                                         <Search size={32} />
                                                     </div>
                                                     <p className="font-bold text-slate-400">No recruiters found matching your search</p>
                                                 </div>
                                             ) : (
                                                 recruiters.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((recruiter) => (
                                                     <div 
                                                         key={recruiter.id} 
                                                         onClick={() => toggleRecruiter(Number(recruiter.id))}
                                                         className={`
                                                             flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2
                                                             ${formData.staffIds.includes(Number(recruiter.id)) 
                                                                 ? "bg-white border-[#5E48B8]/10 shadow-md shadow-indigo-100/30" 
                                                                 : "border-transparent hover:bg-white hover:border-slate-50"}
                                                         `}
                                                     >
                                                         <div className="flex items-center gap-3">
                                                             <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                                 <AvatarImage src={recruiter.avatar || undefined} />
                                                                 <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-[10px]">
                                                                     {recruiter.name.split(' ').map((n: string) => n[0]).join('')}
                                                                 </AvatarFallback>
                                                             </Avatar>
                                                             <div>
                                                                 <p className={`font-bold text-sm transition-colors ${formData.staffIds.includes(Number(recruiter.id)) ? "text-slate-900" : "text-slate-500"}`}>{recruiter.name}</p>
                                                                 <p className="text-[10px] text-slate-400 font-medium">{recruiter.email}</p>
                                                             </div>
                                                         </div>
                                                         <div className={`
                                                             w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                                             ${formData.staffIds.includes(Number(recruiter.id)) 
                                                                 ? "bg-[#5E48B8] border-[#5E48B8] text-white" 
                                                                 : "bg-white border-slate-200"}
                                                         `}>
                                                             {formData.staffIds.includes(Number(recruiter.id)) && <CheckCircle2 size={14} strokeWidth={3} />}
                                                         </div>
                                                     </div>
                                                 ))
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {activeSection === "availability" && (
                                 <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
                                     <div className="space-y-1">
                                         <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Availability</h2>
                                         <p className="text-slate-500 font-medium text-sm">Define when you are available for this specific interview type.</p>
                                     </div>

                                     <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 space-y-8 shadow-inner">
                                         <div className="space-y-5">
                                             <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Weekly Schedule</Label>
                                             <div className="space-y-2.5">
                                                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                                                      const dayConf = (formData.settings.availability.schedule || {})[day] || { enabled: false, startTime: "09:00", endTime: "17:00" };
                                                     return (
                                                         <div key={day} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-[#5E48B8]/20 transition-all">
                                                             <div className="flex items-center gap-4 min-w-[120px]">
                                                                 <Switch 
                                                                     checked={dayConf.enabled} 
                                                                     onCheckedChange={(checked) => updateAvailability(day, { enabled: checked })}
                                                                     className="scale-75" 
                                                                 />
                                                                 <span className="font-bold text-slate-700 tracking-tight text-sm">{day}</span>
                                                             </div>
                                                             <div className="flex flex-1 items-center justify-center gap-3">
                                                                 {dayConf.enabled ? (
                                                                     <>
                                                                          <Input 
                                                                              type="time" 
                                                                              value={dayConf.startTime ?? "09:00"}
                                                                              onChange={(e) => updateAvailability(day, { startTime: e.target.value })}
                                                                              className="h-9 w-32 bg-slate-50 border-slate-100 rounded-lg text-center font-bold text-slate-600 text-xs"
                                                                          />
                                                                         <span className="text-slate-300 font-bold">—</span>
                                                                         <Input 
                                                                             type="time" 
                                                                             value={dayConf.endTime ?? "17:00"}
                                                                             onChange={(e) => updateAvailability(day, { endTime: e.target.value })}
                                                                             className="h-9 w-32 bg-slate-50 border-slate-100 rounded-lg text-center font-bold text-slate-600 text-xs"
                                                                         />
                                                                     </>
                                                                 ) : (
                                                                     <span className="text-slate-400 font-bold text-[10px] tracking-wide bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50 uppercase">Unavailable</span>
                                                                 )}
                                                             </div>
                                                             <div className="flex gap-1.5 focus-within:opacity-100">
                                                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600 rounded-lg">
                                                                     <Plus size={14} />
                                                                 </Button>
                                                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600 rounded-lg">
                                                                     <Copy size={14} />
                                                                 </Button>
                                                             </div>
                                                         </div>
                                                     );
                                                 })}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {activeSection === "scheduling" && (
                                 <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
                                     <div className="space-y-1">
                                         <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Scheduling Rules</h2>
                                         <p className="text-slate-500 font-medium text-sm">Define the constraints for bookable appointments.</p>
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                         <div className="space-y-10">
                                             <div className="space-y-6">
                                                 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                     <Label className="text-[11px] font-black uppercase tracking-widest text-slate-900">Notice Period</Label>
                                                     <Info className="w-3.5 h-3.5 text-slate-300" />
                                                 </div>
                                                 <div className="space-y-3">
                                                     <div className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                                         <div>
                                                             <p className="font-bold text-sm text-slate-800">Minimum Notice</p>
                                                             <p className="text-[10px] text-slate-400 font-medium mt-0.5">Prevents last-minute bookings.</p>
                                                         </div>
                                                         <div className="flex items-center gap-2">
                                                              <Input 
                                                                   type="number"
                                                                   value={formData.settings.scheduling.minimumNotice ?? ""}
                                                                   onChange={(e) => updateScheduling("minimumNotice", e.target.value === "" ? undefined : Number(e.target.value))}
                                                                   className="w-16 h-9 bg-white border-slate-200 rounded-lg text-center font-bold text-sm"
                                                               />
                                                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hrs</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>

                                             <div className="space-y-6">
                                                 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                     <Label className="text-[11px] font-black uppercase tracking-widest text-slate-900">Buffer Times</Label>
                                                     <Info className="w-3.5 h-3.5 text-slate-300" />
                                                 </div>
                                                 <div className="space-y-2">
                                                     {[
                                                         { label: "Before Event", key: "bufferBefore" },
                                                         { label: "After Event", key: "bufferAfter" }
                                                     ].map((item, i) => (
                                                         <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 transition-all">
                                                             <p className="font-bold text-sm text-slate-800">{item.label}</p>
                                                             <div className="flex items-center gap-2">
                                                                  <Input 
                                                                        type="number"
                                                                        value={formData.settings.scheduling[item.key] ?? ""}
                                                                        onChange={(e) => updateScheduling(item.key, e.target.value === "" ? undefined : Number(e.target.value))}
                                                                        className="w-16 h-9 bg-white border-slate-200 rounded-lg text-center font-bold text-sm"
                                                                    />
                                                                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Min</span>
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="space-y-10">
                                             <div className="space-y-6">
                                                 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                     <Label className="text-[11px] font-black uppercase tracking-widest text-slate-900">Limits & Range</Label>
                                                     <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                                                 </div>
                                                 <div className="p-6 bg-[#5E48B8]/5 border border-indigo-100/50 rounded-2xl space-y-5">
                                                     <div className="space-y-2">
                                                         <p className="font-bold text-slate-700 text-xs">Date Range for Bookings</p>
                                                         <Select 
                                                             value={formData.settings.scheduling.dateRange ?? "60"}
                                                             onValueChange={(val) => updateScheduling("dateRange", val)}
                                                         >
                                                             <SelectTrigger className="h-10 bg-white border-none rounded-lg font-bold shadow-sm text-xs">
                                                                 <SelectValue placeholder="Select" />
                                                             </SelectTrigger>
                                                             <SelectContent className="rounded-lg border-slate-100 shadow-xl">
                                                                 <SelectItem value="30">30 Days into future</SelectItem>
                                                                 <SelectItem value="60">60 Days into future</SelectItem>
                                                                 <SelectItem value="90">90 Days into future</SelectItem>
                                                                 <SelectItem value="indefinite">Indefinitely</SelectItem>
                                                             </SelectContent>
                                                         </Select>
                                                     </div>
                                                     <div className="flex items-center justify-between pt-1">
                                                         <div>
                                                             <p className="font-bold text-slate-700 text-xs">Max bookings per day</p>
                                                             <p className="text-[9px] text-slate-400 font-medium">Leave empty for unlimited</p>
                                                         </div>
                                                          <Input 
                                                               type="number" 
                                                               value={formData.settings.scheduling.maxBookingsPerDay ?? ""}
                                                               onChange={(e) => updateScheduling("maxBookingsPerDay", e.target.value === "" ? undefined : Number(e.target.value))}
                                                               placeholder="No limit" 
                                                               className="w-20 h-10 bg-white border-none rounded-lg text-center font-bold text-xs" 
                                                           />
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {activeSection === "notifications" && (
                                 <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
                                     <div className="space-y-1">
                                         <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Preferences</h2>
                                         <p className="text-slate-500 font-medium text-sm">Manage how you and your attendees are notified.</p>
                                     </div>

                                     <div className="space-y-4">
                                         {[
                                             { title: "Email Confirmations", key: "emailConfirmation", desc: "Sent instantly when an interview is booked." },
                                             { title: "Email Reminders", key: "reminders", desc: "Sent 24 hours and 1 hour before the start time." },
                                             { title: "Cancellation Notifications", key: "cancellationPolicy", desc: "Notify all parties when an event is cancelled." },
                                             { title: "Reschedule Policy", key: "reschedulePolicy", desc: "Include a link to allow attendees to reschedule." }
                                         ].map((item, i) => (
                                             <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-indigo-50/5 transition-all duration-300">
                                                 <div className="space-y-0.5">
                                                     <p className="font-bold text-slate-800 tracking-tight text-sm">{item.title}</p>
                                                     <p className="text-xs font-medium text-slate-400">{item.desc}</p>
                                                 </div>
                                                 <Switch 
                                                     checked={formData.settings.notifications[item.key]} 
                                                     onCheckedChange={(checked) => updateNotifications(item.key, checked)}
                                                     className="data-[state=checked]:bg-[#5E48B8] scale-75" 
                                                 />
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                             {activeSection === "form" && (
                                 <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
                                     <div className="flex justify-between items-end">
                                         <div className="space-y-1">
                                             <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Form</h2>
                                             <p className="text-slate-500 font-medium text-sm">Customize the questions asked during the booking process.</p>
                                         </div>
                                         <Button 
                                             onClick={addFormField}
                                             className="h-10 rounded-lg bg-slate-900 text-white font-bold gap-2 px-5 text-sm"
                                         >
                                             <Plus className="w-4 h-4" />
                                             Add Question
                                         </Button>
                                     </div>

                                      <div className="space-y-3">
                                          {(formData.settings?.bookingForm || []).map((field: any, i: number) => (
                                             <div key={field.id || i} className="flex gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl group relative transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                                                 <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#5E48B8] transition-colors shrink-0">
                                                     <Hash size={18} />
                                                 </div>
                                                 <div className="flex-1 space-y-3">
                                                     <div className="flex items-center gap-3">
                                                          <Input 
                                                              value={field.label ?? ""}
                                                              onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                                                              className="bg-transparent border-none p-0 h-auto font-bold text-sm text-slate-800 focus-visible:ring-0 shadow-none"
                                                              placeholder="Question Label"
                                                          />
                                                         <div className={`
                                                             px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest
                                                             ${field.required ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}
                                                         `}>
                                                             {field.required ? "Required" : "Optional"}
                                                         </div>
                                                     </div>
                                                     
                                                     <div className="flex items-center gap-4">
                                                         <div className="flex items-center gap-2">
                                                             <Label className="text-[10px] font-bold text-slate-400">Type:</Label>
                                                             <select 
                                                                 value={field.type}
                                                                 onChange={(e) => updateFormField(field.id, { type: e.target.value })}
                                                                 className="bg-white border border-slate-200 rounded-md text-[11px] font-bold px-2 py-1 outline-none text-slate-600"
                                                             >
                                                                 <option value="text">Short Text</option>
                                                                 <option value="email">Email Address</option>
                                                                 <option value="textarea">Long Text</option>
                                                                 <option value="phone">Phone Number</option>
                                                                 <option value="checkbox">Checkbox</option>
                                                             </select>
                                                         </div>
                                                         
                                                         <div className="flex items-center gap-2 cursor-pointer" onClick={() => updateFormField(field.id, { required: !field.required })}>
                                                             <Switch checked={field.required} className="scale-50 h-4" />
                                                             <Label className="text-[10px] font-bold text-slate-400 cursor-pointer">Required field</Label>
                                                         </div>
                                                     </div>
                                                 </div>
                                                 <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <Button 
                                                         onClick={() => removeFormField(field.id)}
                                                         variant="ghost" 
                                                         size="icon" 
                                                         className="h-8 w-8 text-rose-400 hover:bg-rose-50 rounded-lg shadow-sm border border-transparent hover:border-rose-100"
                                                     >
                                                         <Minus size={14} />
                                                     </Button>
                                                 </div>
                                             </div>
                                         )) || (
                                             <div className="py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No custom questions added</p>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            
            {/* Simple Save Overlay for Mobile */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
                <Button onClick={handleSave} className="w-full h-16 bg-slate-900 text-white font-black text-lg rounded-2xl shadow-2xl border-4 border-white">
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
