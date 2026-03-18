import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookings } from "../hooks/use-bookings";
import { useWorkspace } from "../contexts/WorkspaceContext";

export default function MiniCalendar() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today);
    const { currentWorkspace } = useWorkspace();
    const { data: bookings = [] } = useBookings(currentWorkspace?.id ?? null);

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const renderDays = () => {
        const grid: JSX.Element[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(<div key={`empty-${i}`} className="p-1"></div>);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const hasBookings = bookings.some(b => b.date === dateStr);
            const isToday = today.getDate() === d && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();

            grid.push(
                <div key={`day-${d}`} className="flex flex-col items-center justify-center p-1.5 relative group">
                    <div className={`flex items-center justify-center w-8 h-8 text-sm rounded-lg cursor-pointer transition-all ${isToday ? 'bg-[#1C1917] text-white font-bold shadow-sm' : 'text-gray-700 font-medium hover:bg-gray-100'}`}>
                        {d}
                    </div>
                    {hasBookings && (
                        <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-orange-500'}`} />
                    )}
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="bg-white w-full max-w-sm mx-auto p-4 select-none">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <div className="font-bold text-gray-800 text-sm">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-gray-400">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link to="/bookings" className="text-xs text-yellow-600 font-bold hover:underline">
                    View Full Appointments
                </Link>
            </div>
        </div>
    );
}

