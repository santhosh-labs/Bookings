import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useServices, useService } from "@/hooks/use-services";
import { useCreateBooking } from "@/hooks/use-bookings";
import { usePublicWorkspace } from "@/hooks/use-public-workspace";
import { useAvailability } from "@/hooks/use-availability";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronLeft, Clock, CalendarDays, Loader2, Zap } from "lucide-react";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface BookingContentProps {
  theme: {
    primaryColor: string;
    logoUrl?: string;
    showHeader?: boolean;
    headerTitle?: string;
    backgroundUrl?: string;
  };
  services: any[];
  workspaceId?: number;
  previewMode?: boolean;
}

export function BookingContent({ theme, services, workspaceId, previewMode }: BookingContentProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // No longer auto-selecting to step 2 to allow users to see service details first (Landing Page)
  useEffect(() => {
    if (services && services.length === 1 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [services, selectedService]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const primaryColor = theme.primaryColor || "#5E48B8";
  const createBooking = useCreateBooking();
  
  // Dynamic Availability
  const { data: availabilityData } = useAvailability(workspaceId);
  const schedule = availabilityData?.schedule || {};
  
  // Helper to generate time slots for the selected date
  const generateTimeSlots = () => {
    if (!selectedService || !availabilityData) return [];
    
    // Get day of week for selected date
    const dayName = format(selectedDate, "EEEE");
    const daySchedule = schedule[dayName];
    
    // If day is not active, return no slots
    if (!daySchedule?.active) return [];
    
    const slots = [];
    const [startHour, startMin] = daySchedule.start.split(":").map(Number);
    const [endHour, endMin] = daySchedule.end.split(":").map(Number);
    
    let current = new Date(selectedDate);
    current.setHours(startHour, startMin, 0, 0);
    
    const end = new Date(selectedDate);
    end.setHours(endHour, endMin, 0, 0);
    
    const durationMinutes = selectedService.duration || 60;
    
    while (current.getTime() + durationMinutes * 60000 <= end.getTime()) {
      slots.push(format(current, "hh:mm a").toUpperCase());
      current = new Date(current.getTime() + durationMinutes * 60000);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Calculate next 14 days, but filter by availability
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
    .filter(date => {
      const dayName = format(date, "EEEE");
      return schedule[dayName]?.active;
    });

  // Ensure selectedDate is one of the valid dates
  useEffect(() => {
    if (dates.length > 0 && !dates.find(d => d.toDateString() === selectedDate.toDateString())) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const handleComplete = async () => {
    if (previewMode) {
      setIsSuccess(true);
      return;
    }
    if (!selectedService || !workspaceId) return;
    await createBooking.mutateAsync({
      workspaceId: workspaceId,
      serviceId: Number(selectedService.id),
      staffId: Number(selectedService.staffIds?.[0] || 1),
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      serviceName: selectedService.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      status: "Upcoming",
      notes: null
    });
    setIsSuccess(true);
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  if (isSuccess) {
    return (
      <div className={`${previewMode ? '' : 'min-h-screen'} bg-secondary/30 flex items-center justify-center p-4`}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <Card className="p-8 text-center rounded-3xl shadow-2xl border-white bg-white/80 backdrop-blur-lg">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: primaryColor }}>
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">Booking Confirmed!</h1>
            <p className="text-slate-500 font-medium mb-8">
              Thank you, {formData.name}. Your appointment for <strong className="text-slate-900">{selectedService?.name}</strong> is set for {format(selectedDate, "MMM d, yyyy")} at {selectedTime}.
            </p>
            <Button onClick={() => previewMode ? setIsSuccess(false) : window.location.reload()} variant="outline" className="rounded-2xl h-14 w-full font-bold text-lg border-slate-200">
              {previewMode ? "Restart Preview" : "Book Another Session"}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
        className={`${previewMode ? 'w-full h-full' : 'min-h-screen py-10 px-4 sm:px-6 flex items-center justify-center'} transition-all duration-1000 font-sans`}
        style={{ 
            backgroundImage: !previewMode ? 'url(/default-bg.png)' : 'none',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundColor: !previewMode ? '#F8FAFC' : 'transparent'
        }}
    >
      <div className={`${previewMode ? 'w-full h-full' : 'max-w-[850px] w-full'} animate-in fade-in zoom-in-95 duration-500`}>
        <Card className={`border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/95 backdrop-blur-2xl border flex flex-col ${previewMode ? 'min-h-full border-none shadow-none' : 'min-h-[600px]'} relative`}>
          
          <div className="absolute top-8 right-8 hidden sm:flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100/50 border border-slate-200/20" />
              <div className="w-8 h-8 rounded-xl bg-slate-100/50 border border-slate-200/20" />
          </div>

          {theme.showHeader && (
              <div className="p-10 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-slate-900 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                           {theme.logoUrl ? (
                               <img 
                                   src={theme.logoUrl} 
                                   alt="Logo" 
                                   className="w-full h-full object-cover" 
                                   onError={(e) => {
                                       const target = e.currentTarget;
                                       target.style.display = 'none';
                                       const parent = target.parentElement;
                                       if (parent) {
                                           const icon = document.createElement('div');
                                           icon.className = 'w-7 h-7 text-white flex items-center justify-center';
                                           icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><path d="M4 14.5L12 3v9h8L12 21v-9z"/></svg>';
                                           parent.appendChild(icon);
                                       }
                                   }}
                               />
                           ) : (
                               <Zap className="w-7 h-7 text-white fill-white" />
                           )}
                       </div>
                      <div>
                          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1.5">{theme.headerTitle}</h1>
                          <p className="text-slate-400 font-medium text-xs">Book your personalized interview session</p>
                      </div>
                  </div>
              </div>
          )}

          {step > 1 && (
              <div className="px-10 flex items-center gap-4 mt-2">
                  <button onClick={() => setStep(step - 1)} className="flex items-center text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 transition-all hover:bg-white hover:text-slate-900 shadow-sm">
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                  </button>
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full" 
                        style={{ background: primaryColor }}
                      />
                  </div>
              </div>
          )}

          <div className="flex-1 p-10 pt-6 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait" custom={1}>
              {step === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4 w-full flex-1">
                  <div className="grid gap-4">
                    {services?.filter(s => s.isActive).map(service => (
                        <div
                            key={service.id}
                            onClick={() => { setSelectedService(service); setStep(2); }}
                            className="p-8 rounded-[2rem] border-2 border-slate-50 bg-white shadow-sm hover:shadow-md hover:scale-[1.01] cursor-pointer transition-all duration-300 group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-all overflow-hidden"
                                    style={{ background: service.color || primaryColor }}
                                >
                                    {service.image ? (
                                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                    ) : (
                                        service.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
                                    <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        <Clock className="w-3.5 h-3.5 mr-2 text-slate-300" /> {service.duration} MINS
                                        <span className="mx-3 opacity-20 text-slate-400">|</span>
                                        ONE-ON-ONE
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 transition-all">
                                <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180 group-hover:text-white" />
                            </div>
                        </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full space-y-8 flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select Date & Time</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="mb-4 block text-slate-400 font-black uppercase text-[10px] tracking-widest">Available Dates</Label>
                      <div className="space-y-3">
                        {dates.length === 0 && (
                          <div className="p-10 bg-slate-50 border border-slate-100 rounded-[2rem] text-center">
                            <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">No available dates found</p>
                            <p className="text-slate-400 text-xs mt-1">Please try again later when more slots are opened.</p>
                          </div>
                        )}
                        {dates.map((date, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={`p-4 rounded-[1.25rem] border-2 cursor-pointer transition-all flex items-center justify-between shadow-sm group ${selectedDate.toDateString() === date.toDateString() ? 'bg-white border-slate-900 translate-x-2' : 'bg-slate-50/50 border-transparent hover:border-slate-200'}`}
                            style={{ borderColor: selectedDate.toDateString() === date.toDateString() ? primaryColor : undefined }}
                          >
                            <span className={`font-bold ${selectedDate.toDateString() === date.toDateString() ? 'text-slate-900' : 'text-slate-500'}`}>
                              {format(date, "EEEE, MMM d")}
                            </span>
                            {i === 0 && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-400 font-black uppercase">Today</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-4 block text-slate-400 font-black uppercase text-[10px] tracking-widest">Select Time Slot</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            onClick={() => { setSelectedTime(time); setStep(3); }}
                            className={`p-4 rounded-[1.25rem] border-2 text-center cursor-pointer transition-all font-bold text-base shadow-sm ${selectedTime === time ? 'text-white border-transparent scale-105 shadow-lg' : 'bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white text-slate-500'}`}
                            style={{ background: selectedTime === time ? primaryColor : undefined }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full space-y-8 flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Details</h2>

                  <div className="bg-slate-50/40 border border-slate-100 rounded-[2rem] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl shadow-lg overflow-hidden" style={{ background: selectedService?.color || primaryColor }}>
                            {selectedService?.image ? (
                                <img src={selectedService.image} alt={selectedService.name} className="w-full h-full object-cover" />
                            ) : (
                                selectedService?.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 leading-tight">{selectedService?.name}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-slate-300" />
                                {format(selectedDate, "MMM d")} • {selectedTime}
                            </p>
                        </div>
                    </div>
                    <div className="sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Service Price</p>
                      <p className="font-bold text-3xl text-slate-900">${selectedService?.price}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                      <Input
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe" className="h-14 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-4 focus:ring-slate-50 font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                        <Input
                          type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com" className="h-14 rounded-2xl bg-white border-slate-100 shadow-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</Label>
                        <Input
                          value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000" className="h-14 rounded-2xl bg-white border-slate-100 shadow-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-8 pb-0 flex justify-center mt-auto">
                 {step === 3 ? (
                    <Button
                        onClick={handleComplete}
                        disabled={!formData.name || !formData.email || createBooking.isPending}
                        className="px-20 h-16 rounded-2xl text-lg font-bold text-white shadow-xl transition-all active:scale-95 flex items-center gap-3"
                        style={{ background: primaryColor }}
                    >
                        {createBooking.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                    </Button>
                 ) : step === 2 && selectedTime ? (
                     <Button 
                        onClick={() => setStep(3)}
                        className="px-20 h-16 rounded-2xl text-lg font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                        style={{ background: primaryColor }}
                     >
                         Schedule Now
                     </Button>
                 ) : (
                    <div className="h-16 flex items-center opacity-50">
                        <p className="text-slate-300 font-bold uppercase tracking-widest text-[9px]">Select {step === 1 ? 'a service' : 'a time'} to continue</p>
                    </div>
                 )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PublicBooking() {
  const { orgId, serviceId } = useParams();
  
  const { data: service, isLoading: serviceLoading } = useService(serviceId);
  
  const workspaceIdToFetch = service ? service.workspaceId.toString() : orgId;
  const { data: workspace, isLoading: wsLoading } = usePublicWorkspace(workspaceIdToFetch);
  
  const { data: services, isLoading: servicesLoading } = useServices(
    (!serviceId && workspace) ? (workspace as any).id : null
  );

  const { data: availability, isLoading: availabilityLoading } = useAvailability((workspace as any)?.id);
  
  if (serviceLoading || wsLoading || availabilityLoading || (!serviceId && servicesLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#5E48B8]" />
      </div>
    );
  }

  const servicesToShow = service ? [service] : (services || []);

  const theme = (workspace as any)?.theme || {
    primaryColor: "#5E48B8",
    logoUrl: "",
    showHeader: true,
    headerTitle: (workspace as any)?.name || "Booking Page",
    backgroundUrl: "/default-bg.png"
  };

  return <BookingContent theme={theme} services={servicesToShow} workspaceId={(workspace as any)?.id} />;
}

