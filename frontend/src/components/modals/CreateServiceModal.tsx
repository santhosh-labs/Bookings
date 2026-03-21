import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, User, Users, Monitor, Package, Info, ChevronRight, Loader2, Camera, Clock, CreditCard, MapPin, ChevronLeft, Globe, ChevronDown, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateService } from "../../hooks/use-services";
import { useRecruiters } from "../../hooks/use-recruiters";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CheckCircle2, Search } from "lucide-react";

interface EventType {
    id: string;
    title: string;
    description: string;
    icon: any;
    gradient: string;
    iconColor: string;
    iconBg: string;
    options: { id: string; label: string }[];
}

const EVENT_TYPES: EventType[] = [
    {
        id: "one-on-one",
        title: "One-on-One",
        description: "Ideal for personal meetings, consultations, interviews, and support calls.",
        icon: User,
        gradient: "from-blue-500/10 to-indigo-500/10",
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
        options: [
            { id: "one-time", label: "One Time" },
            { id: "recurring", label: "Recurring" }
        ]
    },
    {
        id: "group",
        title: "Group Event",
        description: "Ideal for webinars, workshops, training sessions, and classes.",
        icon: Users,
        gradient: "from-emerald-500/10 to-teal-500/10",
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
        options: [
            { id: "one-time", label: "One Time" },
            { id: "recurring", label: "Recurring" }
        ]
    },
    {
        id: "collective",
        title: "Collective Event",
        description: "Ideal when multiple hosts meet with one attendee, such as panel discussions or board meetings.",
        icon: Monitor,
        gradient: "from-indigo-500/10 to-purple-500/10",
        iconColor: "text-indigo-600",
        iconBg: "bg-indigo-50",
        options: [
            { id: "one-time", label: "One Time" },
            { id: "recurring", label: "Recurring" }
        ]
    },
    {
        id: "resource",
        title: "Resource Booking",
        description: "Ideal for booking shared resources such as meeting rooms, equipment, or studios.",
        icon: Package,
        gradient: "from-rose-500/10 to-orange-500/10",
        iconColor: "text-rose-600",
        iconBg: "bg-rose-50",
        options: [
            { id: "one-time", label: "One Time" },
            { id: "recurring", label: "Recurring" }
        ]
    }
];

interface CreateServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: number | undefined;
    onSuccess?: () => void;
}

export default function CreateServiceModal({ isOpen, onClose, workspaceId, onSuccess }: CreateServiceModalProps) {
    const navigate = useNavigate();
    const { workspaces } = useWorkspace();
    const { mutateAsync: createService, isPending } = useCreateService();
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<EventType | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<{ id: string; label: string } | null>(null);

    // Form fields for Step 2
    const [localWorkspaceId, setLocalWorkspaceId] = useState<number | string>(workspaceId || (workspaces[0]?.id || ""));
    const [name, setName] = useState("");
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(30);
    const [priceType, setPriceType] = useState("Free");
    const [price, setPrice] = useState<number>(0);
    const [meetingMode, setMeetingMode] = useState("Offline");
    const [location, setLocation] = useState("None");
    const [image, setImage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
    const [recruiterSearchTerm, setRecruiterSearchTerm] = useState("");

    const { data: recruiters = [], isLoading: recruitersLoading } = useRecruiters();

    const resetForm = () => {
        setStep(1);
        setSelectedType(null);
        setSelectedSchedule(null);
        setName("");
        setHours(0);
        setMinutes(30);
        setPriceType("Free");
        setPrice(0);
        setMeetingMode("Offline");
        setLocation("None");
        setImage("");
        setSelectedStaffIds([]);
        setRecruiterSearchTerm("");
        setLocalWorkspaceId(workspaceId || (workspaces[0]?.id || ""));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setImage(data.url);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };


    useEffect(() => {
        if (isOpen) {
            setLocalWorkspaceId(workspaceId || (workspaces[0]?.id || ""));
        } else {
            resetForm();
        }
    }, [isOpen, workspaceId, workspaces]);

    const handleSelectType = (type: EventType, schedule: { id: string; label: string }) => {
        setSelectedType(type);
        setSelectedSchedule(schedule);
        setName("");
        setStep(2);
    };

    const handleCreate = async () => {
        const finalWorkspaceId = workspaceId || localWorkspaceId;

        if (!finalWorkspaceId || !selectedType || !selectedSchedule) {
            alert("Please select a workspace and event type first.");
            return;
        }

        try {
            const h = typeof hours === 'string' ? parseInt(hours) : hours;
            const m = typeof minutes === 'string' ? parseInt(minutes) : minutes;
            const totalDuration = (h * 60) + m;

            const newService = await createService({
                workspaceId: typeof finalWorkspaceId === 'string' ? parseInt(finalWorkspaceId) : finalWorkspaceId,
                name: name || "New Event",
                duration: totalDuration || 30,
                price: priceType === "Paid" ? (typeof price === 'string' ? parseInt(price) : price) : 0,
                location: meetingMode === "Online" ? "Online Meeting" : location,
                category: selectedType.id,
                scheduleType: selectedSchedule.id,
                description: "",
                color: selectedType.iconColor.split('-')[1],
                bufferTime: 10,
                isActive: true,
                staffIds: selectedStaffIds,
                image,
                settings: {}
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to create event:", error);
            alert("Failed to create event. Please try again.");
        }
    };

    return (
        <Transition as={Fragment} show={isOpen}>
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
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
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
                            <Dialog.Panel className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                                {/* Step 1: Selection */}
                                {step === 1 && (
                                    <>
                                        <button
                                            onClick={onClose}
                                            className="absolute top-6 right-6 z-20 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full p-2 transition-all hover:bg-slate-100 active:scale-90"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        <div className="px-10 pt-12 pb-6 text-center">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create New Event</h2>
                                            <p className="text-slate-500 font-medium mt-2">Select the type of event you want to create</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-10 pb-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                            {EVENT_TYPES.map((type) => (
                                                <div
                                                    key={type.id}
                                                    className={`group relative rounded-3xl border-2 border-slate-100 bg-white p-6 transition-all duration-300 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 flex flex-col h-full overflow-hidden`}
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                                    <div className="relative z-10 flex-1 flex flex-col">
                                                        <div className="flex items-start gap-4 mb-4">
                                                            <div className={`w-14 h-14 rounded-2xl ${type.iconBg} ${type.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
                                                                <type.icon className="w-7 h-7" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{type.title}</h3>
                                                            </div>
                                                        </div>

                                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-1">
                                                            {type.description}
                                                        </p>

                                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                                            {type.options.map((option) => (
                                                                <button
                                                                    key={option.id}
                                                                    onClick={() => handleSelectType(type, option)}
                                                                    className={`
                                                                        flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all
                                                                        ${option.id === 'one-time'
                                                                            ? "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                                                                            : "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10"}
                                                                        active:scale-95
                                                                    `}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Step 2: Form Details */}
                                {step === 2 && (
                                    <div className="flex flex-col h-full bg-slate-50">
                                        <div className="px-8 pt-8 pb-4">
                                            {/* Top Preview Card */}
                                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-white flex items-center gap-5">
                                                <div 
                                                    className={`w-16 h-16 rounded-2xl ${selectedType?.iconBg} ${selectedType?.iconColor} flex items-center justify-center shadow-inner relative group/img cursor-pointer transition-all hover:ring-4 hover:ring-indigo-600/10 overflow-hidden`}
                                                    onClick={() => document.getElementById('event-image-upload')?.click()}
                                                >
                                                    {image ? (
                                                        <img src={image} alt="Event" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Camera className={`w-8 h-8 ${isUploading ? 'animate-pulse opacity-20' : 'opacity-40'} text-slate-500`} />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Camera className="w-6 h-6 text-white" />
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        id="event-image-upload" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold text-slate-900 truncate">{name || "Event title"}</h3>
                                                    <p className="text-slate-500 font-medium">{selectedType?.title}</p>
                                                </div>
                                                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-8 pb-8 flex-1">
                                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
                                                {/* Section Header */}
                                                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                                    <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Event Details</h4>
                                                </div>

                                                <div className="p-8 space-y-8 max-h-[50vh] overflow-y-auto custom-scrollbar">

                                                    {/* Workspace Selection (Only if not in a workspace context) */}
                                                    {!workspaceId && (
                                                        <div className="space-y-2.5">
                                                            <label className="text-[13px] font-bold text-slate-600">Workspace <span className="text-rose-500">*</span></label>
                                                            <div className="relative group">
                                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                                    <LayoutGrid size={18} />
                                                                </div>
                                                                 <select
                                                                    value={localWorkspaceId}
                                                                    onChange={(e) => setLocalWorkspaceId(parseInt(e.target.value))}
                                                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-600/30 transition-all"
                                                                >
                                                                    {workspaces.map(ws => (
                                                                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Event Name */}
                                                    <div className="space-y-2.5">
                                                        <label className="text-[13px] font-bold text-slate-600">Event Name <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="e.g. Weekly Sync, Consultation"
                                                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all placeholder:text-slate-300"
                                                        />
                                                    </div>

                                                    {/* Duration */}
                                                    <div className="space-y-2.5">
                                                        <label className="text-[13px] font-bold text-slate-600">Duration</label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="relative group">
                                                                <select
                                                                    value={hours}
                                                                    onChange={(e) => setHours(parseInt(e.target.value))}
                                                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-600/30 transition-all"
                                                                >
                                                                    {[0, 1, 2, 3, 4].map(h => <option key={h} value={h}>{h} Hours</option>)}
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            </div>
                                                            <div className="relative group">
                                                                <select
                                                                    value={minutes}
                                                                    onChange={(e) => setMinutes(parseInt(e.target.value))}
                                                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-600/30 transition-all"
                                                                >
                                                                    {[0, 15, 30, 45].map(m => <option key={m} value={m}>{m} Minutes</option>)}
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="space-y-2.5">
                                                        <label className="text-[13px] font-bold text-slate-600">Price</label>
                                                        <div className="flex gap-4">
                                                            <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem] border border-slate-200 min-w-[180px]">
                                                                {["Free", "Paid"].map(p => (
                                                                    <button
                                                                        key={p}
                                                                        onClick={() => setPriceType(p)}
                                                                        className={`flex-1 h-10 rounded-xl text-[13px] font-bold transition-all ${priceType === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                                                    >
                                                                        {p}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div className={`flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 overflow-hidden transition-all ${priceType === "Free" ? "opacity-40 grayscale pointer-events-none" : "focus-within:border-indigo-600/30 ring-indigo-600/5 ring-0 focus-within:ring-4"}`}>
                                                                <span className="text-slate-400 font-bold mr-3 font-mono text-sm">₹</span>
                                                                <input
                                                                    type="number"
                                                                    value={price}
                                                                    onChange={(e) => setPrice(parseInt(e.target.value))}
                                                                    className="w-full h-full bg-transparent font-bold text-slate-700 outline-none"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Meeting Mode */}
                                                    <div className="space-y-2.5">
                                                        <label className="text-[13px] font-bold text-slate-600">Meeting Mode</label>
                                                        <div className="flex gap-4">
                                                            <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem] border border-slate-200 min-w-[200px]">
                                                                {["Online", "Offline"].map(m => (
                                                                    <button
                                                                        key={m}
                                                                        onClick={() => setMeetingMode(m)}
                                                                        className={`flex-1 h-10 rounded-xl text-[13px] font-bold transition-all ${meetingMode === m ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                                                    >
                                                                        {m}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div className="relative flex-1 group">
                                                                <select
                                                                    value={location}
                                                                    onChange={(e) => setLocation(e.target.value)}
                                                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-600/30 transition-all"
                                                                >
                                                                    <option value="None">None</option>
                                                                    <option value="In Person">In Person</option>
                                                                    <option value="Phone Call">Phone Call</option>
                                                                    <option value="Video Call (Zoom)">Video Call (Zoom)</option>
                                                                    <option value="Video Call (Google Meet)">Video Call (Google Meet)</option>
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Assign Recruiters */}
                                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[13px] font-bold text-slate-600">Assign Recruiters</label>
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                                <input 
                                                                    type="text"
                                                                    placeholder="Search..."
                                                                    value={recruiterSearchTerm}
                                                                    onChange={(e) => setRecruiterSearchTerm(e.target.value)}
                                                                    className="h-9 w-40 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-xs font-bold text-slate-700 focus:border-indigo-600/30 outline-none transition-all shadow-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar pb-2">
                                                            {recruitersLoading ? (
                                                                <div className="col-span-full py-10 flex flex-col items-center gap-2 text-slate-300">
                                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
                                                                </div>
                                                            ) : recruiters.filter(r => r.name.toLowerCase().includes(recruiterSearchTerm.toLowerCase())).length === 0 ? (
                                                                <div className="col-span-full py-10 text-center">
                                                                    <p className="text-xs font-bold text-slate-400">No recruiters found</p>
                                                                </div>
                                                            ) : (
                                                                recruiters.filter(r => r.name.toLowerCase().includes(recruiterSearchTerm.toLowerCase())).map((recruiter) => {
                                                                    const isSelected = selectedStaffIds.includes(Number(recruiter.id));
                                                                    return (
                                                                        <div 
                                                                            key={recruiter.id}
                                                                            onClick={() => {
                                                                                const id = Number(recruiter.id);
                                                                                setSelectedStaffIds(prev => 
                                                                                    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                                                                );
                                                                            }}
                                                                            className={`
                                                                                flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border-2
                                                                                ${isSelected 
                                                                                    ? "bg-white border-indigo-600/10 shadow-md shadow-indigo-100/30" 
                                                                                    : "bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200"}
                                                                            `}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <Avatar className="w-8 h-8 border-2 border-white shadow-sm shrink-0">
                                                                                    <AvatarImage src={recruiter.avatar || undefined} />
                                                                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-[8px]">
                                                                                        {recruiter.name.split(' ').map((n: string) => n[0]).join('')}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="min-w-0">
                                                                                    <p className={`font-bold text-xs truncate transition-colors ${isSelected ? "text-slate-900" : "text-slate-500"}`}>{recruiter.name}</p>
                                                                                    <p className="text-[9px] text-slate-400 font-medium truncate">{recruiter.designation || recruiter.role || "Recruiter"}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className={`
                                                                                w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
                                                                                ${isSelected 
                                                                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                                                                    : "bg-white border-slate-200"}
                                                                            `}>
                                                                                {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Buttons */}
                                        <div className="px-8 pb-10 flex gap-4 mt-auto">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="flex-1 h-14 bg-white hover:bg-slate-100 text-slate-800 font-black rounded-2xl border border-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleCreate}
                                                disabled={isPending || !name.trim()}
                                                className="flex-[1.5] h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Creation"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
