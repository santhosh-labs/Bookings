import { useState } from "react";
import { Layout } from "@/components/layout";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Calendar as CalendarIcon, List, CheckCircle2, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const [view, setView] = useState("list");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const calendarEvents = bookings?.map(b => ({
    id: String(b.id),
    title: `${b.customerName} - ${b.serviceName}`,
    start: `${b.date}T${b.time}`,
    backgroundColor: b.status.toLowerCase() === 'upcoming' ? 'hsl(var(--primary))' : 
                    b.status.toLowerCase() === 'completed' ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)',
    borderColor: 'transparent'
  })) || [];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage your schedule and appointments.</p>
        </div>

        <Tabs value={view} onValueChange={setView} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary rounded-xl">
            <TabsTrigger value="list" className="rounded-lg data-[state=active]:shadow-sm"><List className="w-4 h-4 mr-2"/> List</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:shadow-sm"><CalendarIcon className="w-4 h-4 mr-2"/> Cal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-xl"></div>
          <div className="h-12 bg-muted rounded-xl"></div>
          <div className="h-12 bg-muted rounded-xl"></div>
        </div>
      ) : view === "list" ? (
        <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {bookings?.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{booking.customerName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.serviceName}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{booking.date}</div>
                      <div className="text-muted-foreground text-xs">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-secondary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'Completed')} className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'Cancelled')} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                            <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-sm p-6 rounded-2xl bg-card">
          <FullCalendar
            plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            height="700px"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            expandRows={true}
            stickyHeaderDates={true}
          />
        </Card>
      )}
    </Layout>
  );
}
