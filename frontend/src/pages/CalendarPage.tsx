import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { useState } from "react";

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Booking Calendar</h1>
                    <p className="text-muted-foreground">View and manage your appointments in a monthly view.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold bg-white hover:bg-slate-50">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Quick Appointment
                    </button>
                </div>
            </div>

            <div className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/30">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-2 bg-white border p-1 rounded-xl">
                        <button 
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-3 py-1.5 text-xs font-black uppercase tracking-widest hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b bg-slate-50/50">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="px-4 py-3 text-xs font-black uppercase text-slate-400 text-center tracking-widest border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="flex-1 grid grid-cols-7 grid-rows-5 font-sans">
                    {days.map((day, di) => (
                        <div 
                            key={di} 
                            className={`min-h-[120px] p-2 border-r border-b last:border-r-0 hover:bg-slate-50/50 transition-colors flex flex-col gap-2 ${
                                !isSameMonth(day, currentMonth) ? "bg-slate-50/30 opacity-40" : ""
                            }`}
                        >
                            <div className="flex justify-between items-baseline">
                                <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-lg ${
                                    isToday(day) ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400"
                                }`}>
                                    {format(day, "d")}
                                </span>
                            </div>
                            
                            {/* Dummy Appointments */}
                            {di % 7 === 1 && (
                                <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-700 truncate shadow-sm">
                                    9 AM - Marcus S.
                                </div>
                            )}
                            {di % 7 === 3 && (
                                <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700 truncate shadow-sm">
                                    2 PM - Sara L.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
