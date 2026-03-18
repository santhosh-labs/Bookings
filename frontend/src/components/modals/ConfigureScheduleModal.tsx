import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Plus, ChevronDown, Calendar, Clock, Globe, Settings2, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useServices } from "../../hooks/use-services";

interface ConfigureScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

const DAYS = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
];

const TIME_OPTIONS = Array.from({ length: 24 * 4 }).map((_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    const ampm = hours >= 12 ? "pm" : "am";
    const h12 = hours % 12 || 12;
    const time = `${h12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    return time;
});

export default function ConfigureScheduleModal({ isOpen, onClose }: ConfigureScheduleModalProps) {
    const { data: services = [] } = useServices();
    const [scheduleName, setScheduleName] = useState("New Template");
    const [availableDates, setAvailableDates] = useState("forever");
    const [timezone, setTimezone] = useState("Asia/Kolkata - IST (+05:30)");
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [activeDays, setActiveDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"]);
    const [times, setTimes] = useState<Record<string, { start: string, end: string }[]>>(
        DAYS.reduce((acc, day) => ({ 
            ...acc, 
            [day.id]: [{ start: "09:00 am", end: "06:00 pm" }] 
        }), {})
    );

    const toggleDay = (dayId: string) => {
        setActiveDays(prev => prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]);
    };

    const addTimeSlot = (dayId: string) => {
        setTimes(prev => ({
            ...prev,
            [dayId]: [...prev[dayId], { start: "09:00 am", end: "06:00 pm" }]
        }));
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 font-sans" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-white" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full flex-col">
                        {/* Header */}
                        <div className="flex h-16 items-center justify-between px-8 border-b border-slate-100 sticky top-0 bg-white z-20">
                            <Dialog.Title className="text-xl font-bold text-slate-900">
                                Configure Schedule
                            </Dialog.Title>
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={onClose}
                                    className="px-6 py-2 bg-[#5E48B8] hover:bg-[#4C3A96] text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Save
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={onClose}
                                    className="px-6 py-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </Button>
                                <button onClick={onClose} className="p-2 ml-2 rounded-full hover:bg-slate-50 text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Content Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-12">
                                {/* Top Form Rows */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Schedule Name <span className="text-rose-500">*</span></Label>
                                        <Input 
                                            value={scheduleName}
                                            onChange={e => setScheduleName(e.target.value)}
                                            className="h-11 bg-white border-slate-200 rounded-xl focus:border-[#5E48B8] focus:ring-1 focus:ring-[#5E48B8] transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Available Dates <span className="text-rose-500">*</span></Label>
                                        <Select value={availableDates} onValueChange={setAvailableDates}>
                                            <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="forever" className="font-medium">Forever</SelectItem>
                                                <SelectItem value="range" className="font-medium">Date Range</SelectItem>
                                                <SelectItem value="indefinitely" className="font-medium">Indefinitely</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Time Zone</Label>
                                        <Select value={timezone} onValueChange={setTimezone}>
                                            <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Asia/Kolkata - IST (+05:30)" className="font-medium">Asia/Kolkata - IST (+05:30)</SelectItem>
                                                <SelectItem value="UTC" className="font-medium">UTC (+00:00)</SelectItem>
                                                <SelectItem value="America/New_York" className="font-medium">New York - EST (-05:00)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Event Types</Label>
                                        <div className="relative">
                                            <Select>
                                                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl font-medium text-slate-400">
                                                    {selectedServices.length === 0 ? "Select event types" : `${selectedServices.length} selected`}
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl p-2 w-[300px]">
                                                    <div className="p-2 border-b mb-2">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <Input placeholder="Search event types" className="pl-8 h-9 text-xs rounded-lg border-slate-100" />
                                                        </div>
                                                    </div>
                                                    {services.map(s => (
                                                        <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                                            onClick={() => setSelectedServices(prev => prev.includes(s.id!) ? prev.filter(id => id !== s.id) : [...prev, s.id!])}
                                                        >
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedServices.includes(s.id!) ? 'bg-[#5E48B8] border-[#5E48B8]' : 'border-slate-300'}`}>
                                                                {selectedServices.includes(s.id!) && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center font-black text-[10px]">
                                                                {s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700">{s.name}</span>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Weekly Schedule Rows */}
                                <div className="space-y-1 py-8">
                                    {DAYS.map(day => (
                                        <div key={day.id} className="grid grid-cols-12 items-center gap-4 py-4 border-b border-slate-50 border-dashed last:border-0 group">
                                            <div className="col-span-3 flex items-center gap-3">
                                                <Checkbox 
                                                    id={`day-${day.id}`} 
                                                    checked={activeDays.includes(day.id)}
                                                    onCheckedChange={() => toggleDay(day.id)}
                                                    className="w-5 h-5 border-slate-300 data-[state=checked]:bg-[#5E48B8] data-[state=checked]:border-[#5E48B8]"
                                                />
                                                <Label htmlFor={`day-${day.id}`} className={`text-sm font-bold cursor-pointer transition-colors ${activeDays.includes(day.id) ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {day.label}
                                                </Label>
                                            </div>
                                            
                                            <div className="col-span-9 flex flex-col gap-3">
                                                {activeDays.includes(day.id) ? (
                                                    times[day.id].map((slot, index) => (
                                                        <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                                            <div className="w-[140px]">
                                                                <Select defaultValue={slot.start}>
                                                                    <SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl font-bold text-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="max-h-60 rounded-xl">
                                                                        {TIME_OPTIONS.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <span className="text-slate-300 font-medium">—</span>
                                                            <div className="w-[140px]">
                                                                <Select defaultValue={slot.end}>
                                                                    <SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl font-bold text-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="max-h-60 rounded-xl">
                                                                        {TIME_OPTIONS.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <button 
                                                                onClick={() => addTimeSlot(day.id)}
                                                                className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#5E48B8] hover:border-[#5E48B8]/30 hover:bg-indigo-50 transition-all font-black text-xl active:scale-90"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="h-10 flex items-center">
                                                        <div className="w-[140px]">
                                                            <Select disabled>
                                                                <SelectTrigger className="h-10 bg-slate-50 border-slate-100 rounded-xl text-slate-300 font-bold opacity-50">
                                                                    <SelectValue placeholder="09:00 am" />
                                                                </SelectTrigger>
                                                            </Select>
                                                        </div>
                                                        <span className="mx-3 text-slate-100">—</span>
                                                        <div className="w-[140px]">
                                                            <Select disabled>
                                                                <SelectTrigger className="h-10 bg-slate-50 border-slate-100 rounded-xl text-slate-300 font-bold opacity-50">
                                                                    <SelectValue placeholder="06:00 pm" />
                                                                </SelectTrigger>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Panel - Overrides */}
                            <div className="w-[450px] border-l border-slate-100 bg-white flex flex-col p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2 cursor-pointer group">
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">All Overrides</span>
                                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="h-10 px-4 rounded-xl font-bold gap-2 border-slate-200 shadow-sm active:scale-95">
                                            <Plus className="w-4 h-4" /> Add
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-200 rounded-xl active:scale-95">
                                            <Settings2 className="w-4 h-4 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-white/50 blur-xl scale-150 animate-pulse rounded-full" />
                                        <Calendar className="w-20 h-20 text-slate-200 relative z-10" />
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border">
                                            <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center">
                                                <X className="w-2.5 h-2.5 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">No date overrides</h3>
                                    <p className="text-sm text-slate-500 font-medium text-center mt-2 max-w-[220px] leading-relaxed">
                                        Add exceptions to your standard weekly hours for holidays or special events.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
