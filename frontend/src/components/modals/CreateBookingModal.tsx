import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useServices } from "@/hooks/use-services";
import { useCustomers } from "@/hooks/use-customers";
import { useRecruiters } from "@/hooks/use-recruiters";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Loader2, Calendar, Clock, User, Briefcase, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateBookingModal({ isOpen, onClose }: CreateBookingModalProps) {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: services = [] } = useServices(currentWorkspace?.id);
  const { data: recruiters = [] } = useRecruiters(currentWorkspace?.id);
  const { data: customers = [] } = useCustomers(currentWorkspace?.id);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: "",
    staffId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    const selectedService = services.find(s => s.id === Number(formData.serviceId));
    if (!selectedService) return;

    try {
      await createBooking.mutateAsync({
        workspaceId: currentWorkspace.id,
        serviceId: Number(formData.serviceId),
        staffId: Number(formData.staffId) || recruiters[0]?.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        serviceName: selectedService.name,
        date: formData.date,
        time: formData.time,
        status: "Upcoming",
        notes: formData.notes || null,
      });
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-8 pb-6 border-b border-primary/10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <DialogHeader className="p-0">
            <DialogTitle className="text-2xl font-display font-bold text-slate-900">New Appointment</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Manually schedule a new booking for your workspace.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 border-b pb-2">Customer Info</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                  <Input
                    required
                    placeholder="John Doe"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</Label>
                    <Input
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</Label>
                    <Input
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 border-b pb-2">Service & Schedule</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Service</Label>
                  <Select 
                    onValueChange={(val) => setFormData({ ...formData, serviceId: val })}
                    value={formData.serviceId}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-semibold">
                      <SelectValue placeholder="Chose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.duration}m)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Staff</Label>
                  <Select 
                    onValueChange={(val) => setFormData({ ...formData, staffId: val })}
                    value={formData.staffId}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-semibold">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {recruiters.map(r => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl font-bold h-12 flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createBooking.isPending || !formData.serviceId}
              className="rounded-xl font-bold h-12 flex-1 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
