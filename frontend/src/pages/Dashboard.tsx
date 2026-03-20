import { 
  CalendarDays, 
  Users, 
  DollarSign, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useBookings } from "../hooks/use-bookings";
import { useDashboardStats } from "../hooks/use-dashboard";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateCustomerModal from "../components/modals/CreateCustomerModal";
import TrendsModal from "../components/modals/TrendsModal";
import CreateBookingModal from "../components/modals/CreateBookingModal";

export default function Dashboard() {
  const { currentWorkspace, workspaces, isLoading: isLoadingWorkspaces } = useWorkspace();
  const { data: bookings = [], isLoading: isLoadingBookings } = useBookings(currentWorkspace?.id ?? null);
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats(currentWorkspace?.id ?? null);
  
  const [trendsModalOpen, setTrendsModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  if (isLoadingWorkspaces || (currentWorkspace && isLoadingStats)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center border-2 border-primary/20 shadow-xl shadow-primary/5">
          <CalendarDays className="w-12 h-12" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-3xl font-display font-bold">Welcome to Appointify</h2>
          <p className="text-muted-foreground text-lg text-pretty">Create your first workspace to start managing appointments and event types like a pro.</p>
        </div>
        <Button asChild className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
          <Link to="/workspaces/new">Create Workspace</Link>
        </Button>
      </div>
    );
  }

  const stats = [
    { 
      name: "Today's Bookings", 
      value: dashboardStats?.todayBookings || 0, 
      icon: CalendarDays, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      trend: "+12% from yesterday"
    },
    { 
      name: "Upcoming Sessions", 
      value: dashboardStats?.upcomingBookings || 0, 
      icon: Clock, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      trend: "5 booked for tomorrow"
    },
    { 
      name: "Total Customers", 
      value: dashboardStats?.totalBookings || 0, 
      icon: Users, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      trend: "+4 new this week"
    },
    { 
      name: "Total Revenue", 
      value: `$${(dashboardStats?.revenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-rose-600", 
      bg: "bg-rose-50",
      trend: "+$240 today" 
    },
  ];

  const container = {
    show: { transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your bookings today.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="h-11 rounded-xl font-bold bg-white"
            onClick={() => setTrendsModalOpen(true)}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </Button>
          <Button 
            className="h-11 px-5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            onClick={() => setBookingModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div key={stat.name} variants={item}>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.name}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-4 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-border shadow-sm rounded-3xl overflow-hidden min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="font-display">Recent Appointments</CardTitle>
                <div className="text-sm text-muted-foreground font-medium">Your most recent customer interactions.</div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-y">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingBookings ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-6 py-8 bg-slate-50/20" />
                        </tr>
                      ))
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium">
                          No recent activity.
                        </td>
                      </tr>
                    ) : (
                      bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {booking.customerName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900">{booking.customerName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600">{booking.serviceName}</td>
                          <td className="px-6 py-4">
                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-bold text-[10px] px-2 uppercase tracking-wide">
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{booking.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t flex justify-center">
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary" asChild>
                  <Link to="/bookings">View All Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-primary/5 border-primary/10 h-full">
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl justify-start px-5 font-bold shadow-sm" 
                variant="outline"
                onClick={() => setCustomerModalOpen(true)}
              >
                <Users className="w-5 h-5 mr-4 text-blue-500" />
                Add New Customer
              </Button>
              <Button className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl justify-start px-5 font-bold shadow-sm" variant="outline" asChild>
                <Link to="/services">
                  <DollarSign className="w-5 h-5 mr-4 text-emerald-500" />
                  Configure Pricing
                </Link>
              </Button>
              <Button className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl justify-start px-5 font-bold shadow-sm" variant="outline" asChild>
                <Link to="/availability">
                  <Clock className="w-5 h-5 mr-4 text-amber-500" />
                  Edit Schedule
                </Link>
              </Button>
              
              <div className="pt-6 mt-6 border-t border-primary/10">
                <div className="bg-white rounded-2xl p-4 border shadow-sm">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Live Booking Link</p>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs font-mono text-slate-500 mb-4 truncate italic">
                    {window.location.origin}/book/{currentWorkspace?.slug || "your-workspace"}
                  </div>
                  <Button 
                    className="w-full rounded-xl h-10 font-bold" 
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/book/${currentWorkspace?.slug || "your-workspace"}`);
                      alert("Copied to clipboard!");
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <TrendsModal 
        isOpen={trendsModalOpen}
        onClose={() => setTrendsModalOpen(false)}
      />
      
      <CreateCustomerModal 
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
      />

      <CreateBookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </motion.div>
  );
}
