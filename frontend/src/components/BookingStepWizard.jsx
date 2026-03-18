import {
    CalendarDays, Clock, User, CheckCircle2,
    ChevronRight, ChevronLeft, Globe, Phone, Mail, ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateBooking } from "../hooks/use-bookings";
import { useRecruiters } from "../hooks/use-recruiters";

export default function BookingStepWizard({ service, workspace }) {
    const { mutateAsync: createBooking, isPending } = useCreateBooking();
    const { data: recruiters = [] } = useRecruiters(service?.workspaceId);
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: ""
    });

    const timeSlots = [
        "09:00 am", "09:15 am", "09:30 am", "09:45 am",
        "10:00 am", "10:15 am", "10:30 am", "10:45 am",
        "11:00 am", "11:15 am", "11:30 am", "11:45 am",
        "04:00 pm", "04:15 pm", "04:30 pm", "04:45 pm",
        "05:00 pm", "05:15 pm", "05:30 pm"
    ];

    const assignedRecruiter = recruiters.find(r => r.id === service?.staffIds?.[0]);
    const hostName = assignedRecruiter?.name || workspace?.ownerName || "Santhosh S";
    const serviceName = service?.name || "Recruitment Strategy Meeting";
    const duration = service?.duration || 30;
    const initial = serviceName.substring(0, 2).toUpperCase();

    // Calendar logic
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const bookingData = {
                workspaceId: Number(workspace?.id || service?.workspaceId || 1),
                serviceId: Number(service?.id || 1),
                staffId: Number(service?.staffIds?.[0] || 1),
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                serviceName: service?.name || "Service",
                date: dateStr,
                time: selectedTime,
                status: "Upcoming",
                notes: formData.notes
            };
            console.log("Submitting booking:", bookingData);
            await createBooking(bookingData);
            setStep(3);
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Failed to book appointment. Please try again.");
        }
    };

    const renderCalendar = () => {
        const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const firstDayOfMonth = (startOfMonth(currentMonth).getDay() + 6) % 7; // Adjust for Monday start
        const blanks = Array(firstDayOfMonth).fill(null);

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between text-white/90 mb-4 px-2">
                    <span className="font-bold text-lg">{format(currentMonth, 'MMM yyyy')}</span>
                    <div className="flex gap-4">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {weekdays.map(d => (
                        <div key={d} className="text-[10px] font-bold text-white/40 uppercase tracking-widest pb-3">{d}</div>
                    ))}
                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} className="p-3" />
                    ))}
                    {daysInMonth.map(day => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        return (
                            <button
                                key={day.toString()}
                                onClick={() => handleDateSelect(day)}
                                className={`p-3 text-sm font-bold rounded-lg transition-all relative group ${isSelected
                                    ? 'bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                                    : 'text-white/80 hover:bg-white/10'
                                    }`}
                            >
                                {format(day, 'd')}
                                {isToday && !isSelected && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="pt-8 border-t border-white/10 mt-auto">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Time Zone</p>
                    <div className="flex items-center gap-2 text-white/80 text-xs font-medium bg-white/5 p-2 rounded-lg border border-white/10">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Asia/Kolkata - IST (+05:30)</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40 rotate-90" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] text-white">

            {/* Left Info Panel */}
            <div className="w-full md:w-80 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col gap-10">
                {step > 1 && step < 4 ? (
                    <button onClick={prevStep} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                ) : (
                    <div className="h-5" /> // Spacer to keep layout consistent when Back is hidden
                )}

                <div className="space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-[#34d399]/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center font-black text-3xl shadow-inner">
                        {initial}
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-[28px] font-extrabold tracking-tight leading-tight text-white/95">{serviceName}</h1>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-white/60 text-sm">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-transparent border border-white/20 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-white/60" />
                            </div>
                            <span className="text-white font-bold text-base tracking-tight">{hostName}</span>
                        </div>

                        <div className="flex items-center gap-4 text-white/60 text-[15px] font-bold">
                            <Clock className="w-5 h-5 text-emerald-400" />
                            <span className="text-white/80">{duration} mins</span>
                        </div>

                        {step >= 3 && (
                            <div className="flex items-center gap-4 text-white/60 text-[15px] font-bold">
                                <CalendarDays className="w-5 h-5 text-emerald-400" />
                                <span className="text-white/80">{format(selectedDate, 'dd MMM yyyy')} {selectedTime}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-white/60 text-[15px] font-bold">
                            <Globe className="w-5 h-5 text-emerald-400" />
                            <span className="text-white/80">Asia/Kolkata</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col lg:flex-row gap-12 h-full"
                        >
                            {/* Calendar Section */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-8 text-white/90">Select date and time</h3>
                                {renderCalendar()}
                            </div>

                            {/* Slots Section */}
                            <div className="w-full lg:w-72 flex flex-col">
                                <h3 className="text-lg font-bold mb-8 text-white/90 truncate">
                                    {format(selectedDate, 'EEEE, MMMM d')}
                                </h3>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[420px]">
                                    {timeSlots.map(time => (
                                        <div key={time} className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedTime(time)}
                                                className={`flex-1 py-4 px-6 rounded-xl border border-white/10 text-sm font-bold transition-all relative overflow-hidden ${selectedTime === time
                                                    ? 'bg-slate-700/80 border-emerald-400/50 text-white translate-x-1'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                            {selectedTime === time && (
                                                <button
                                                    onClick={nextStep}
                                                    className="px-6 py-4 bg-emerald-400 text-slate-900 font-bold rounded-xl shadow-lg transition-all animate-in slide-in-from-left-2 duration-300"
                                                >
                                                    Next
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="max-w-md mx-auto w-full py-12"
                        >
                            <h3 className="text-2xl font-bold mb-8 text-center text-white/90">Please enter your details</h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Name <span className="text-rose-400">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Email <span className="text-rose-400">*</span></label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Contact Number <span className="text-rose-400">*</span></label>
                                    <div className="flex gap-2">
                                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 flex items-center gap-2 font-medium shrink-0">
                                            <span className="text-sm">🇮🇳</span>
                                            <span className="text-sm">+91</span>
                                            <ChevronRight className="w-3.5 h-3.5 rotate-90 opacity-40" />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Contact Number"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.name || !formData.email || !formData.phone || isPending}
                                    className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-900 py-5 rounded-xl font-black text-base shadow-xl transition-all active:scale-95 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? "Scheduling..." : "Schedule Appointment"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-12 px-4 w-full"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white drop-shadow-md">
                                Appointment confirmed with {hostName}!
                            </h2>

                            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden group">
                                {/* Decorative Dots */}
                                <div className="absolute top-12 left-12 w-2 h-2 rounded-full bg-blue-400/40 animate-pulse" />
                                <div className="absolute top-24 left-32 w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
                                <div className="absolute bottom-12 left-24 w-2 h-2 rounded-full bg-amber-400/40 animate-bounce" />
                                <div className="absolute top-40 right-12 w-2 h-2 rounded-full bg-rose-400/40" />
                                <div className="absolute bottom-20 right-32 w-1.5 h-1.5 rounded-full bg-indigo-400/40" />

                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    {/* Calendar Icon Box */}
                                    <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center relative flex-shrink-0">
                                        <div className="w-20 h-20 border-2 border-slate-800 rounded-lg flex flex-col overflow-hidden bg-white">
                                            <div className="h-6 border-b-2 border-slate-800 flex justify-around p-1">
                                                <div className="w-1 h-3 bg-slate-800 rounded-full -mt-2" />
                                                <div className="w-1 h-3 bg-slate-800 rounded-full -mt-2" />
                                            </div>
                                            <div className="flex-1 flex items-center justify-center p-2">
                                                <CheckCircle2 className="w-10 h-10 text-slate-800" strokeWidth={1} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Appointment Info */}
                                    <div className="flex-1 text-center md:text-left space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            {format(selectedDate, 'dd MMM yyyy')} | {selectedTime}
                                        </h3>
                                        <p className="text-lg font-medium text-slate-600">
                                            {serviceName}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-400 flex items-center justify-center md:justify-start gap-2">
                                            Asia/Calcutta GMT +05:30
                                        </p>
                                    </div>

                                    {/* Options Toggle */}
                                    <div className="absolute top-8 right-8">
                                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 bg-current rounded-full" />
                                                <div className="w-1 h-1 bg-current rounded-full" />
                                                <div className="w-1 h-1 bg-current rounded-full" />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Links */}
                                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-6 text-sm font-bold text-blue-500">
                                    <button className="hover:underline transition-all">+ Add to Calendar</button>
                                    <span className="text-slate-200">|</span>
                                    <button className="hover:underline transition-all">Download as ICS</button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="mt-12 px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black transition-all text-white active:scale-95"
                            >
                                Schedule another session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(52, 211, 153, 0.4);
                }
            `}</style>
        </div>
    );
}
