import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
    Save, 
    Globe, 
    Clock, 
    Loader2, 
    Plus, 
    CheckCircle2, 
    AlertCircle,
    Calendar,
    ChevronRight,
    Search,
    Info
} from "lucide-react";
import { useAvailability, useUpdateAvailability } from "@/hooks/use-availability";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIMEZONES = [
    { value: "America/New_York", label: "Eastern Time (ET) - New York" },
    { value: "America/Chicago", label: "Central Time (CT) - Chicago" },
    { value: "America/Denver", label: "Mountain Time (MT) - Denver" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT) - Los Angeles" },
    { value: "UTC", label: "UTC - Universal Time" },
    { value: "Europe/London", label: "GMT - London" },
    { value: "Europe/Paris", label: "CET - Paris" },
    { value: "Asia/Dubai", label: "GST - Dubai" },
    { value: "Asia/Kolkata", label: "IST - India" },
    { value: "Asia/Tokyo", label: "JST - Tokyo" },
    { value: "Australia/Sydney", label: "AEST - Sydney" },
];

export default function Availability() {
    const { currentWorkspace } = useWorkspace();
    const { data, isLoading, isError } = useAvailability(currentWorkspace?.id);
    const updateMutation = useUpdateAvailability();
    const { toast } = useToast();

    const [schedule, setSchedule] = useState<Record<string, any>>({});
    const [timezone, setTimezone] = useState("America/New_York");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (data?.schedule) {
            setSchedule(data.schedule);
        } else if (!isLoading) {
            setSchedule(DAYS.reduce((acc, day) => ({
                ...acc, 
                [day]: { active: day !== 'Saturday' && day !== 'Sunday', start: "09:00", end: "17:00" }
            }), {}));
        }
        if (data?.timezone) {
            setTimezone(data.timezone);
        }
    }, [data, isLoading]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateMutation.mutateAsync({ 
                schedule, 
                timezone, 
                workspaceId: currentWorkspace?.id 
            });
            toast({
                title: "Schedule Saved",
                description: "Your availability has been updated successfully.",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to save availability. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#5E48B8]" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Availability</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 mb-2">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Failed to load availability</h2>
                <p className="text-slate-500 max-w-sm font-medium">There was an issue fetching your schedule. Please refresh the page or try again later.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 rounded-xl border-slate-200 font-bold gap-2">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-[#5E48B8] rounded-xl flex items-center justify-center shadow-inner">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Availability</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg ml-1">Configure your weekly working hours and timezone.</p>
                </div>
                
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving || updateMutation.isPending}
                    className="bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 px-8 h-14 font-black text-base gap-3"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? "Saving Changes" : "Save Availability"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Schedule Column */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-slate-100 shadow-xl shadow-indigo-50/20 rounded-[2.5rem] overflow-hidden bg-white border">
                        <CardHeader className="p-10 pb-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none">Weekly Hours</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium text-sm">Select the days and times you're available for bookings.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Active Schedule</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {DAYS.map(day => (
                                    <div 
                                        key={day} 
                                        className={`px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 ${!schedule[day]?.active ? 'bg-slate-50/30 opacity-60' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <div className="flex items-center gap-6 min-w-[200px]">
                                            <Switch 
                                                checked={!!schedule[day]?.active}
                                                onCheckedChange={(c) => setSchedule({...schedule, [day]: {...schedule[day], active: c}})}
                                                className="data-[state=checked]:bg-[#5E48B8]"
                                            />
                                            <div>
                                                <Label className={`text-lg font-black tracking-tight ${schedule[day]?.active ? 'text-slate-800' : 'text-slate-400'}`}>{day}</Label>
                                                {!schedule[day]?.active && <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Unavailable</p>}
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence mode="wait">
                                            {schedule[day]?.active ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-4 flex-1 justify-end max-w-sm"
                                                >
                                                    <div className="relative group flex-1">
                                                        <select 
                                                            value={schedule[day].start}
                                                            onChange={(e) => setSchedule({...schedule, [day]: {...schedule[day], start: e.target.value}})}
                                                            className="w-full bg-white border border-slate-100 rounded-[1.25rem] px-5 py-3.5 text-sm font-black text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-[#5E48B8]/30 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                                        >
                                                            {Array.from({ length: 24 }).map((_, i) => {
                                                                const hour = i.toString().padStart(2, '0');
                                                                const display = i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i-12}:00 PM`;
                                                                return <option key={hour} value={`${hour}:00`}>{display}</option>;
                                                            })}
                                                        </select>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 absolute right-12 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                                    </div>
                                                    
                                                    <span className="text-slate-200 font-bold text-lg select-none">—</span>
                                                    
                                                    <div className="relative group flex-1">
                                                        <select 
                                                            value={schedule[day].end}
                                                            onChange={(e) => setSchedule({...schedule, [day]: {...schedule[day], end: e.target.value}})}
                                                            className="w-full bg-white border border-slate-100 rounded-[1.25rem] px-5 py-3.5 text-sm font-black text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-[#5E48B8]/30 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                                        >
                                                            {Array.from({ length: 24 }).map((_, i) => {
                                                                const hour = i.toString().padStart(2, '0');
                                                                const display = i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i-12}:00 PM`;
                                                                return <option key={hour} value={`${hour}:00`}>{display}</option>;
                                                            })}
                                                        </select>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 absolute right-12 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                                    </div>

                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-white hover:shadow-sm">
                                                        <Plus size={18} />
                                                    </Button>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex-1 text-right sm:pr-10"
                                                >
                                                    <span className="text-xs font-black uppercase text-slate-300 tracking-[0.2em] select-none">Closed for Bookings</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-slate-100 shadow-xl shadow-indigo-50/20 rounded-[2.5rem] bg-slate-900 text-white border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                        <CardHeader className="p-8 relative z-10">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 transition-transform hover:scale-110">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <CardTitle className="text-xl font-black tracking-tight leading-none text-white">Workspace Timezone</CardTitle>
                            <CardDescription className="text-slate-400 font-medium text-sm pt-2">All booking slots will be based on this central timezone.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 relative z-10">
                            <div className="relative group">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                                <select 
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-white/5 outline-none transition-all shadow-inner appearance-none cursor-pointer hover:bg-white/20"
                                >
                                    {TIMEZONES.map(tz => (
                                        <option key={tz.value} value={tz.value} className="bg-slate-900 text-white font-bold py-2">{tz.label}</option>
                                    ))}
                                </select>
                                <ChevronRight className="w-4 h-4 text-slate-500 absolute right-6 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                            </div>
                            
                            <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                                    <Info className="w-4 h-4 text-indigo-400" />
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                    Clients will automatically see your available slots converted to their local time when booking.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-xl shadow-indigo-50/20 rounded-[2.5rem] bg-white border overflow-hidden">
                         <CardHeader className="p-8">
                             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100/50">
                                <Calendar className="w-6 h-6" />
                             </div>
                             <CardTitle className="text-xl font-black tracking-tight leading-none text-slate-900">Holiday Overrides</CardTitle>
                             <CardDescription className="text-slate-400 font-medium text-sm pt-2">Set specific dates where your usual hours don't apply.</CardDescription>
                         </CardHeader>
                         <CardContent className="p-8 pt-0">
                             <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 font-bold gap-3 hover:bg-slate-50 hover:border-slate-200 shadow-sm border transition-all text-slate-600">
                                <Plus size={18} />
                                Add Custom Date
                             </Button>
                             <p className="text-center mt-6 text-[10px] font-black uppercase tracking-widest text-slate-300">No overrides active</p>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
