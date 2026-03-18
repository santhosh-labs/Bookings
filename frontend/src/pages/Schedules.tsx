import { useState } from "react";
import { Plus, Clock, Globe, Calendar, ChevronRight, Settings2 } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import ConfigureScheduleModal from "../components/modals/ConfigureScheduleModal";

export default function Schedules() {
    const { currentWorkspace } = useWorkspace();
    const [activeTab, setActiveTab] = useState("Templates");
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Availability Schedules</h1>
                    <p className="text-slate-500 font-medium">Manage your recurring availability and schedule overrides.</p>
                </div>
                <button 
                    onClick={() => setIsConfigOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#5E48B8] hover:bg-[#4C3A96] text-white rounded-xl font-bold shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    New Schedule
                </button>
            </div>

            <ConfigureScheduleModal 
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
            />

            <div className="flex gap-10 border-b border-slate-100">
                {["Templates", "Recurring", "Overrides"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? "text-[#5E48B8]" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5E48B8] rounded-full animate-in fade-in zoom-in duration-300" />}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:border-[#5E48B8]/30 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="w-14 h-14 bg-indigo-50 text-[#5E48B8] rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <Clock className="w-7 h-7" />
                        </div>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Settings2 className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-black text-xl text-slate-900 mb-2 truncate">Standard Working Hours</h3>
                        <p className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2">
                             Monday — Friday • 9:00 am — 5:00 pm
                        </p>
                        <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                            <Globe className="w-4 h-4 text-slate-300" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Asia/Kolkata (IST)</span>
                        </div>
                    </div>
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                </div>

                <div 
                    onClick={() => setIsConfigOpen(true)}
                    className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer hover:bg-white hover:border-[#5E48B8]/30 hover:shadow-lg hover:shadow-indigo-50/30 transition-all"
                >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                        <Plus className="w-6 h-6 text-[#5E48B8]" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-slate-900">Add Custom Template</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">Create a reusable schedule for different event types.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
