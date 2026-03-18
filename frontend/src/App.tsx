import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import Bookings from "./pages/Bookings";
import Services from "./pages/Services";
import Schedules from "./pages/Schedules";
import Availability from "./pages/Availability";
import Customers from "./pages/Customers";
import ThemesAndLayouts from "./pages/ThemesAndLayouts";
import Settings from "./pages/Settings";
import BookingPages from "./pages/BookingPages";
import BookingPageDetail from "./pages/BookingPageDetail";
import Workflows from "./pages/Workflows";
import Recruiters from "./pages/Recruiters";
import MyProfile from "./pages/MyProfile";
import Notifications from "./pages/Notifications";
import PublicBooking from "./pages/PublicBooking";
import AuthPage from "./pages/auth";
import CreateWorkspace from "./pages/CreateWorkspace";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { useAuth } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <WorkspaceProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<AuthPage isLogin={true} />} />
                        <Route path="/register" element={<AuthPage isLogin={false} />} />
                        <Route path="/book/:orgId" element={<PublicBooking />} />
                        <Route path="/book/s/:serviceId" element={<PublicBooking />} />
                        
                        <Route path="/workspaces/new" element={
                            <AuthGuard><CreateWorkspace /></AuthGuard>
                        } />
                        
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        
                        <Route path="/dashboard" element={<AuthGuard><DashboardLayout><Dashboard /></DashboardLayout></AuthGuard>} />
                        <Route path="/calendar" element={<AuthGuard><DashboardLayout><CalendarPage /></DashboardLayout></AuthGuard>} />
                        <Route path="/bookings" element={<AuthGuard><DashboardLayout><Bookings /></DashboardLayout></AuthGuard>} />
                        <Route path="/services" element={<AuthGuard><DashboardLayout><Services /></DashboardLayout></AuthGuard>} />
                        <Route path="/schedules" element={<AuthGuard><DashboardLayout><Schedules /></DashboardLayout></AuthGuard>} />
                        <Route path="/availability" element={<AuthGuard><DashboardLayout><Availability /></DashboardLayout></AuthGuard>} />
                        <Route path="/booking-pages" element={<AuthGuard><DashboardLayout><BookingPages /></DashboardLayout></AuthGuard>} />
                        <Route path="/booking-pages/:serviceId" element={<AuthGuard><DashboardLayout><BookingPageDetail /></DashboardLayout></AuthGuard>} />
                        <Route path="/customers" element={<AuthGuard><DashboardLayout><Customers /></DashboardLayout></AuthGuard>} />
                        <Route path="/workflows" element={<AuthGuard><DashboardLayout><Workflows /></DashboardLayout></AuthGuard>} />
                        <Route path="/recruiters" element={<AuthGuard><DashboardLayout><Recruiters /></DashboardLayout></AuthGuard>} />
                        <Route path="/profile" element={<AuthGuard><DashboardLayout><MyProfile /></DashboardLayout></AuthGuard>} />
                        <Route path="/notifications" element={<AuthGuard><DashboardLayout><Notifications /></DashboardLayout></AuthGuard>} />
                        <Route path="/settings" element={<AuthGuard><DashboardLayout><Settings /></DashboardLayout></AuthGuard>} />
                        <Route path="/themes-and-layouts" element={<AuthGuard><DashboardLayout><ThemesAndLayouts /></DashboardLayout></AuthGuard>} />
                        
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </WorkspaceProvider>
        </QueryClientProvider>
    );
}
