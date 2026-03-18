import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar as CalendarIcon, 
  List as ListIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Settings2
} from "lucide-react";
import { format } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { useBookings, useUpdateBookingStatus } from "../hooks/use-bookings";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateBookingModal from "../components/modals/CreateBookingModal";

export default function Bookings() {
  const { currentWorkspace } = useWorkspace();
  const { data: bookings = [], isLoading } = useBookings(currentWorkspace?.id);
  const updateStatusMutation = useUpdateBookingStatus();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsModalOpen(true);
      // Optional: clear the param after opening
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("new");
      setSearchParams(newParams);
    }
  }, [searchParams]);

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Upcoming":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-2.5 py-0.5 rounded-full">Upcoming</Badge>;
      case "Completed":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2.5 py-0.5 rounded-full">Completed</Badge>;
      case "Cancelled":
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 font-bold px-2.5 py-0.5 rounded-full">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-100 font-bold px-2.5 py-0.5 rounded-full">{status}</Badge>;
    }
  };

  const calendarEvents = bookings.map(b => ({
    id: String(b.id),
    title: `${b.customerName} - ${b.serviceName}`,
    start: `${b.date}T${b.time}`,
    backgroundColor: b.status === "Upcoming" ? "hsl(var(--primary))" : b.status === "Completed" ? "#059669" : "#e11d48",
    borderColor: "transparent",
    extendedProps: { ...b }
  }));

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your schedule and customer bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl font-bold bg-white hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-5 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
            New Booking
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-12">
            <TabsTrigger value="list" className="rounded-lg px-6 font-bold truncate">
              <ListIcon className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg px-6 font-bold truncate">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search appointments..." 
                className="pl-10 h-11 rounded-xl bg-white border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0 bg-white">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-3xl">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium text-lg">Loading appointments...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-dashed rounded-3xl">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
                <CalendarIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No appointments found</h2>
              <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                {searchTerm ? "Try adjusting your search filters." : "Start by creating your first appointment manually or via the public booking page."}
              </p>
              {!searchTerm && (
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-xl font-bold h-11 px-6 shadow-md"
                >
                  Create Appointment
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                      <th className="px-8 py-5">Customer</th>
                      <th className="px-8 py-5">Service</th>
                      <th className="px-8 py-5">Date & Time</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right w-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {b.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 leading-tight">{b.customerName}</span>
                              <span className="text-xs text-muted-foreground font-medium">{b.customerEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <Link to={`/booking-pages/${b.serviceId}`} className="font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-2">
                            {b.serviceName}
                          </Link>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{format(new Date(b.date), "MMMM d, yyyy")}</span>
                            <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                              <Clock className="w-3 h-3 mr-1" />
                              {b.time} (30m)
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {getStatusBadge(b.status)}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
                              <DropdownMenuLabel className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1 px-2.5">Manage</DropdownMenuLabel>
                              <DropdownMenuItem 
                                className="rounded-lg font-bold py-2.5 cursor-pointer"
                                onClick={() => navigate(`/booking-pages/${b.serviceId}`)}
                              >
                                <Settings2 className="w-4 h-4 mr-2" />
                                Booking Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg font-bold py-2.5 cursor-pointer">View Customer</DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg font-bold py-2.5 cursor-pointer">Edit Booking</DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1.5" />
                              <DropdownMenuItem className="rounded-lg font-bold py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700">Cancel Booking</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-8 py-4 bg-slate-50/50 border-t flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Showing {filteredBookings.length} appointments
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
          <div className="bg-white border rounded-3xl p-6 shadow-sm min-h-[700px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              events={calendarEvents}
              height="auto"
              eventClick={(info) => {
                console.log("Event clicked:", info.event.extendedProps);
              }}
              dayMaxEvents={true}
            />
          </div>
        </TabsContent>
      </Tabs>

      <CreateBookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
