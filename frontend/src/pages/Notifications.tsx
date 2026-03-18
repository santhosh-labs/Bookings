import { useNotifications } from "../hooks/use-notifications";
import { Bell, CheckCircle2, AlertCircle, Info, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Notifications() {
    const { notifications, isLoading, markRead, markAllRead } = useNotifications();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-black">
                        {notifications.filter(n => !n.isRead).length} New
                    </span>
                </div>
                <button 
                    onClick={() => markAllRead.mutate()}
                    className="text-sm font-bold text-primary hover:underline"
                >
                    Mark all as read
                </button>
            </div>

            <div className="space-y-3">
                {notifications.length > 0 ? (
                    notifications.map((notif: any) => (
                        <div 
                            key={notif.id} 
                            onClick={() => !notif.isRead && markRead.mutate(notif.id)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                                notif.isRead ? "bg-white border-border opacity-70" : "bg-white border-blue-100 shadow-sm shadow-blue-50 ring-1 ring-blue-50"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                notif.type === 'success' ? 'bg-green-50 text-green-600' :
                                notif.type === 'warning' ? 'bg-rose-50 text-rose-600' :
                                'bg-blue-50 text-blue-600'
                            }`}>
                                {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                 notif.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                                 <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-800">{notif.title}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{notif.createdAt}</span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">{notif.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-3xl opacity-50">
                        <Bell className="w-12 h-12 mb-4" />
                        <p className="font-bold">No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
