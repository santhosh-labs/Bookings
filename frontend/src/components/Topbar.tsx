import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Bell, Settings, User, Users, CalendarDays, Clock, Building,
    Video, Plus, Search, HelpCircle, ChevronRight,
    LogOut, UserCircle, SlidersHorizontal, X
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import MiniCalendar from "./MiniCalendar";
import InviteRecruiterModal from "./modals/InviteRecruiterModal";
import { useWorkspace } from "../contexts/WorkspaceContext";

import { useNotifications } from "../hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useMe, useAuth } from "../hooks/use-auth";

// Page title map
const PAGE_TITLES: Record<string, { title: string; crumb: string[] }> = {
    "/dashboard": { title: "Dashboard", crumb: ["Home", "Dashboard"] },
    "/bookings": { title: "Appointments", crumb: ["Home", "Appointments"] },
    "/services": { title: "Events", crumb: ["Home", "Events"] },
    "/booking-pages": { title: "Booking Pages", crumb: ["Home", "Booking Pages"] },
    "/availability": { title: "Availability", crumb: ["Home", "Availability"] },
    "/customers": { title: "Customers", crumb: ["Home", "Customers"] },
    "/schedules": { title: "Schedules", crumb: ["Home", "Schedules"] },
    "/workflows": { title: "Workflows", crumb: ["Home", "Workflows"] },
    "/recruiters": { title: "Recruiters", crumb: ["Home", "Recruiters"] },
    "/profile": { title: "My Profile", crumb: ["Home", "My Profile"] },
    "/notifications": { title: "Notifications", crumb: ["Home", "Notifications"] },
    "/settings": { title: "Settings", crumb: ["Home", "Settings"] },
};

export default function Topbar() {
    const location = useLocation();
    const { currentWorkspace } = useWorkspace();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [notifOpen, setNotifOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const { notifications, markRead, markAllRead } = useNotifications();
    const { logout } = useAuth();
    const { data: me } = useMe();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const pageInfo = PAGE_TITLES[location.pathname] ?? { title: "Dashboard", crumb: ["Home"] };

    // Auto-focus search
    useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus();
    }, [searchOpen]);

    // Close search on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setSearchOpen(false); setSearchVal(""); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <header className="h-14 bg-white backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-5 z-30 sticky top-0 shrink-0 shadow-sm">

            {/* -- Left: breadcrumb ------------------------------------ */}
            <div className="flex items-center gap-2 min-w-0">
                <nav className="flex items-center gap-1.5 text-sm">
                    {pageInfo.crumb.map((segment: string, i: number) => (
                        <span key={i} className="flex items-center gap-1.5">
                            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                            <span
                                className={i === pageInfo.crumb.length - 1
                                    ? "font-semibold text-gray-900 truncate"
                                    : "text-gray-500 hover:text-gray-700 cursor-pointer transition-colors text-sm"
                                }
                            >
                                {segment}
                            </span>
                        </span>
                    ))}
                </nav>
            </div>

            {/* -- Right: actions ------------------------------------- */}
            <div className="flex items-center gap-1">

                {/* Trial badge removed */}

                {/* Quick Create */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            id="topbar-new-btn"
                            className="flex items-center gap-1.5 h-8 px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-slate-700/20 focus:outline-none focus:ring-2 focus:ring-slate-700/40"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl border border-border shadow-lg bg-white mt-1.5 p-1.5">
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1">
                            Create
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link to="/bookings?new=true" className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-sm font-medium text-foreground hover:bg-muted">
                                <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center shrink-0">
                                    <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                Appointment
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/services" className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-sm font-medium text-foreground hover:bg-muted">
                                <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center shrink-0">
                                    <Video className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                Event
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-sm font-medium text-foreground hover:bg-muted">
                            <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center shrink-0">
                                <Users className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            Recruiter
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/workspaces/new" className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-sm font-medium text-foreground hover:bg-muted">
                                <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center shrink-0">
                                    <Building className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                Workspace
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <InviteRecruiterModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                />


                {/* Divider */}
                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Notifications */}
                <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            id="topbar-notif-btn"
                            className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700/30"
                        >
                            <Bell className="w-[17px] h-[17px]" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-xl border border-border shadow-xl bg-white mt-1.5 p-0 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <span className="font-semibold text-sm text-gray-900">Notifications</span>
                            {unreadCount > 0 && (
                                <button onClick={() => markAllRead.mutate()} className="text-xs text-slate-700 font-semibold hover:underline">Mark all read</button>
                            )}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">No notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.isRead && markRead.mutate(n.id)}
                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-orange-50/50' : ''}`}
                                    >
                                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-orange-500' : 'bg-gray-300'}`} />
                                        <div>
                                            <p className={`text-sm ${!n.isRead ? 'font-bold' : 'font-medium'} text-gray-900`}>{n.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="px-4 py-2.5 border-t border-border">
                            <Link to="/notifications" onClick={() => setNotifOpen(false)} className="block w-full text-center text-xs text-slate-700 font-semibold hover:underline">View all notifications</Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Help */}
                <button
                    id="topbar-help-btn"
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700/30"
                    title="Help"
                >
                    <HelpCircle className="w-[17px] h-[17px]" />
                </button>

                {/* Settings */}
                <Link
                    to="/settings"
                    id="topbar-settings-btn"
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700/30"
                    title="Settings"
                >
                    <Settings className="w-[17px] h-[17px]" />
                </Link>

                {/* Profile Avatar dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            id="topbar-profile-btn"
                            className="ml-3 flex items-center gap-2.5 hover:opacity-80 transition-opacity focus:outline-none rounded-full"
                        >
                            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 bg-white shadow-sm shrink-0 overflow-hidden">
                                {me?.avatar ? (
                                    <img src={me.avatar} alt={me.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>
                            <span className="text-[13px] font-black text-[#1e3a5f] uppercase tracking-tight mr-1 hidden sm:block">
                                {me?.name || "JOHN DOE"}
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border shadow-xl bg-white mt-1.5 p-1.5">
                        {/* User info header */}
                        <div className="flex items-center gap-3 px-3 py-3 mb-1">
                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold shrink-0 uppercase overflow-hidden">
                                {me?.avatar ? (
                                    <img src={me.avatar} alt={me.name} className="w-full h-full object-cover" />
                                ) : (
                                    me?.name ? me.name.split(' ').map(n => n[0]).join('') : "JD"
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-800 truncate">{me?.name || "John Doe"}</p>
                                <p className="text-xs text-gray-400 truncate">{me?.email || "john@example.com"}</p>
                            </div>
                        </div>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem asChild>
                            <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                                <UserCircle className="w-4 h-4 text-gray-400" />
                                My Account
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem 
                            onClick={() => logout.mutate()}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                        >
                            <LogOut className="w-4 h-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}



