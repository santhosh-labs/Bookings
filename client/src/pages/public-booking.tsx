import { useState } from "react";
import { useServices } from "@/hooks/use-services";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronLeft, Clock, CalendarDays, User } from "lucide-react";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicBooking() {
  const { data: services, isLoading: servicesLoading } = useServices();
  const createBooking = useCreateBooking();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock timeslots
  const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];
  const dates = Array.from({length: 7}, (_, i) => addDays(new Date(), i));

  const handleComplete = async () => {
    await createBooking.mutateAsync({
      customerName: formData.name,
      serviceName: selectedService.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      status: "Upcoming"
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
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <Card className="p-8 text-center rounded-3xl shadow-xl border-border/50">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-3">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you, {formData.name}. Your appointment for <strong className="text-foreground">{selectedService?.name}</strong> is set for {format(selectedDate, "MMM d, yyyy")} at {selectedTime}. We've sent a calendar invite to your email.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl h-11 w-full">
              Book Another Session
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold font-display mx-auto mb-4 shadow-lg shadow-primary/20">
            A
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Appointify Inc.</h1>
          <p className="text-muted-foreground mt-2">Book a session with our team</p>
        </div>

        <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden bg-card/80 backdrop-blur-xl">
          {/* Progress Bar */}
          <div className="bg-secondary/50 p-4 border-b border-border/50 flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step-1)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              {[1,2,3].map(i => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step >= i ? 'bg-primary scale-110' : 'bg-border'}`} />
              ))}
            </div>
            <div className="w-16" /> {/* Spacer */}
          </div>

          <div className="p-6 sm:p-10 min-h-[400px] relative overflow-hidden">
            <AnimatePresence mode="wait" custom={1}>
              {step === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4 w-full">
                  <h2 className="text-xl font-display font-bold mb-6">Select a Service</h2>
                  {servicesLoading ? (
                    <div className="space-y-3">
                      {[1,2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}
                    </div>
                  ) : (
                    services?.filter(s => s.isActive).map(service => (
                      <div 
                        key={service.id}
                        onClick={() => { setSelectedService(service); setStep(2); }}
                        className="p-5 rounded-2xl border-2 border-border/50 hover:border-primary cursor-pointer hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{service.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <Clock className="w-4 h-4 mr-1.5" /> {service.duration} mins
                              <span className="mx-3 border-l h-3"></span>
                              ${service.price}
                            </div>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full">
                  <h2 className="text-xl font-display font-bold mb-6">Select Date & Time</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="mb-3 block text-muted-foreground uppercase text-xs font-bold tracking-wider">Date</Label>
                      <div className="space-y-2">
                        {dates.map((date, i) => (
                          <div 
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedDate.toDateString() === date.toDateString() ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-border'}`}
                          >
                            <span className={`font-medium ${selectedDate.toDateString() === date.toDateString() ? 'text-primary' : 'text-foreground'}`}>
                              {format(date, "EEEE, MMM d")}
                            </span>
                            {i === 0 && <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground font-semibold">Today</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-3 block text-muted-foreground uppercase text-xs font-bold tracking-wider">Time</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((time) => (
                          <div 
                            key={time}
                            onClick={() => { setSelectedTime(time); setStep(3); }}
                            className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all font-medium ${selectedTime === time ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105' : 'border-border/50 hover:border-primary hover:bg-primary/5 hover:text-primary'}`}
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
                <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full">
                  <h2 className="text-xl font-display font-bold mb-6">Your Details</h2>
                  
                  {/* Summary Card */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-foreground">{selectedService?.name}</p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1.5" /> 
                        {format(selectedDate, "MMM d, yyyy")} at {selectedTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total</p>
                      <p className="font-display font-bold text-xl text-primary">${selectedService?.price}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe" className="h-12 rounded-xl bg-background" 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input 
                          type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="john@example.com" className="h-12 rounded-xl bg-background" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input 
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="+1 (555) 000-0000" className="h-12 rounded-xl bg-background" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleComplete} 
                      disabled={!formData.name || !formData.email || createBooking.isPending}
                      className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all mt-4"
                    >
                      {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}
