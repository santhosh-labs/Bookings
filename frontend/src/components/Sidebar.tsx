import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard, CalendarDays, Video, Globe, Clock,
    LayoutTemplate, Users, Settings, User, Plus, Building2,
    ChevronRight, ChevronDown, ChevronsLeft, ChevronsRight, LogOut,
    Zap, BarChart3, FileText, Layers
} from "lucide-react";
import { useAuth, useMe } from "../hooks/use-auth";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "./ui/select";
import { queryClient } from "../lib/queryClient";

// --- Nav config --------------------------------------------------------------
const MY_SPACE_NAV = [
    {
        label: "MAIN",
        items: [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { name: "Appointments", path: "/bookings", icon: CalendarDays },
            { name: "Events", path: "/services", icon: Video },
        ],
    },
    {
        label: "MANAGEMENT",
        items: [
            { name: "Booking Pages", path: "/booking-pages", icon: Globe },
            { name: "Availability", path: "/availability", icon: Clock },
            { name: "Users", path: "/recruiters", icon: Users },
            { name: "Customers", path: "/customers", icon: Layers },
        ],
    },
    {
        label: "SETTINGS",
        items: [
            { name: "My Profile", path: "/profile", icon: User },
            { name: "Settings", path: "/settings", icon: Settings },
        ],
    },
];

const WORKSPACE_NAV = [
    {
        label: "MAIN",
        items: [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { name: "Appointments", path: "/bookings", icon: CalendarDays },
            { name: "Events", path: "/services", icon: Video },
             { name: "Booking Pages", path: "/booking-pages", icon: Globe },
        ],
    },
    {
        label: "MANAGEMENT",
        items: [
            { name: "Schedules", path: "/schedules", icon: Clock },
            { name: "Workflows", path: "/workflows", icon: LayoutTemplate },
            { name: "Users", path: "/recruiters", icon: Users },
        ],
    },
    {
        label: "SETTINGS",
        items: [
            { name: "Settings", path: "/settings", icon: Settings },
        ],
    },
];

// --- Single nav item ----------------------------------------------------------
function NavItem({ item, isActive, collapsed }: { item: any, isActive: boolean, collapsed: boolean }) {
    return (
        <Link
            to={item.path}
            title={collapsed ? item.name : undefined}
            className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150 group
                ${collapsed ? "justify-center px-2" : ""}
                ${isActive
                    ? "bg-slate-100/80 text-slate-900 font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-[3px] before:rounded-r-full before:bg-slate-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }
            `}
        >
            <item.icon
                className={`shrink-0 transition-colors ${isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-800"
                    }`}
                size={17}
            />
            {!collapsed && (
                <span className="truncate leading-none">{item.name}</span>
            )}

            {/* Active dot when collapsed */}
            {collapsed && isActive && (
                <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-white" />
            )}
        </Link>
    );
}

// --- Main Sidebar -------------------------------------------------------------
export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { workspaces, currentWorkspace, setCurrentWorkspaceById, role } = useWorkspace();
    const { user: me, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isOwner = role === "OWNER" || currentWorkspace === null;

    const sections = (currentWorkspace === null ? MY_SPACE_NAV : WORKSPACE_NAV).map(section => ({
        ...section,
        items: section.items.filter(item => {
            // Hide Users from staff in workspace view
            if (item.name === "Users" && role === "STAFF") return false;
            return true;
        })
    }));

    const wsInitials = currentWorkspace
        ? currentWorkspace.name.substring(0, 2).toUpperCase()
        : "MS";
    const wsName = currentWorkspace ? currentWorkspace.name : "My Space";

    return (
        <div
            className={`
                relative flex flex-col h-full shrink-0 overflow-hidden bg-white border-r border-slate-200
                transition-all duration-300 ease-in-out select-none
                ${collapsed ? "w-[60px]" : "w-[220px]"}
            `}
        >
            {/* -- Header / Logo --------------------------------------- */}
            <div
                className="flex items-center gap-3 px-3 py-4 shrink-0 border-b border-slate-200"
            >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 shadow-sm shadow-slate-200">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-[15px] text-slate-800 tracking-tight truncate">
                        Bookings
                    </span>
                )}
            </div>

            {/* -- Workspace switcher ---------------------------------- */}
            {!collapsed && (
                <div
                    className="px-3 py-3 shrink-0 border-b border-slate-200"
                >
                    <Select
                        value={currentWorkspace === null ? "all" : currentWorkspace.id.toString()}
                        onValueChange={(val) => {
                            if (val === "new") navigate("/workspaces/new");
                            else {
                                const newWsId = val === "all" ? null : Number(val);
                                setCurrentWorkspaceById(newWsId);
                                queryClient.invalidateQueries(); // Refresh all data for new workspace context
                                navigate("/dashboard"); // Always reset to dashboard when switching
                            }
                        }}
                    >
                        <SelectTrigger
                            className="w-full h-10 px-2 rounded-xl text-sm font-medium border border-slate-200 focus:ring-1 focus:ring-slate-400 focus-visible:ring-slate-400 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <div className="flex items-center gap-2.5 truncate">
                                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold shrink-0 border border-slate-200">
                                    {wsInitials}
                                </div>
                                <span className="font-semibold text-[13.5px] truncate text-slate-800">{wsName}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl w-[210px] p-1 z-[100]">
                            <SelectItem value="all" className="cursor-pointer py-3 rounded-lg hover:bg-slate-50 focus:bg-slate-50 text-slate-900 border-none outline-none">
                                <div className="flex flex-col ml-1">
                                    <span className="font-bold text-[13.5px]">My Space</span>
                                    <span className="text-[11px] text-slate-400">View all workspaces</span>
                                </div>
                            </SelectItem>
                            <SelectSeparator className="my-1.5 bg-slate-100" />
                            {workspaces.length > 0 && (
                                <div className="px-3 py-1.5 text-[10px] tracking-widest font-black text-slate-400 uppercase">
                                    Your Workspaces
                                </div>
                            )}
                            {workspaces.map((ws) => (
                                <SelectItem key={ws.id} value={ws.id.toString()} className="cursor-pointer py-2.5 rounded-lg hover:bg-slate-50 focus:bg-slate-50 text-slate-900 border-none outline-none mb-0.5">
                                    <div className="flex items-center gap-2.5 ml-1">
                                        <div className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 border border-slate-200">
                                            {ws.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-[13px]">{ws.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                            <SelectSeparator className="my-1.5 bg-slate-100" />
                            <SelectItem value="new" className="cursor-pointer py-2.5 rounded-lg hover:bg-blue-50 focus:bg-blue-50 text-blue-600 border-none outline-none">
                                <div className="flex items-center gap-2.5 ml-1 font-bold text-[13px]">
                                    <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center shrink-0">
                                        <Plus className="w-3.5 h-3.5" />
                                    </div>
                                    New workspace
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Collapsed: workspace avatar only */}
            {collapsed && (
                <div
                    className="flex justify-center py-3 shrink-0 border-b border-slate-200"
                >
                    <div
                        title={wsName}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
                    >
                        {wsInitials}
                    </div>
                </div>
            )}



            {/* -- Navigation ------------------------------------------ */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4">
                {sections.map((section, si) => (
                    <div key={si}>
                        {/* Section label */}
                        {!collapsed && (
                            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                                {section.label}
                            </p>
                        )}

                        {collapsed && si > 0 && (
                            <div className="mx-auto mb-2 w-5 h-px bg-slate-50" />
                        )}

                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                                return (
                                    <NavItem
                                        key={item.name}
                                        item={item}
                                        isActive={isActive}
                                        collapsed={collapsed}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* -- Collapse toggle ------------------------------------- */}
            <div className="px-2 pb-2 shrink-0">
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className={`
                        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                        text-sm font-medium transition-colors
                        text-slate-400 hover:text-slate-800 hover:bg-slate-50
                        ${collapsed ? "justify-center" : ""}
                    `}
                >
                    {collapsed
                        ? <ChevronsRight size={16} />
                        : <><ChevronsLeft size={16} /><span>Collapse</span></>
                    }
                </button>
            </div>

            {/* -- Bottom user ----------------------------------------- */}
            <div
                className="px-2 py-3 shrink-0 border-t border-slate-200"
            >
                <Link
                    to="/profile"
                    title={collapsed ? "My Profile" : undefined}
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-colors cursor-pointer group
                        text-slate-500 hover:text-slate-900 hover:bg-slate-50
                        ${collapsed ? "justify-center" : ""}
                    `}
                >
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow overflow-hidden uppercase">
                        {me?.name ? me.name.split(' ').map((n: string) => n[0]).join('') : "JD"}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[13px] text-slate-800 leading-none truncate">{me?.name || "John Doe"}</p>
                            <p className="text-[11px] mt-0.5 truncate text-slate-400">{role || "User"}</p>
                        </div>
                    )}
                    <button 
                        onClick={() => {
                            logout.mutateAsync().then(() => navigate("/login"));
                        }}
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
                        title="Logout"
                    >
                        <LogOut size={14} className="opacity-40 group-hover:opacity-100" />
                    </button>
                </Link>
            </div>
        </div>
    );
}


