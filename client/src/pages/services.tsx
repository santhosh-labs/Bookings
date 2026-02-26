import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, MapPin, Clock, Edit2, Scissors } from "lucide-react";
import { useServices, useCreateService, useUpdateService } from "@/hooks/use-services";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Services() {
  const { data: services, isLoading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", duration: 30, price: 0, bufferTime: 10, location: "", isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      duration: Number(formData.duration),
      price: Number(formData.price),
      bufferTime: Number(formData.bufferTime)
    };

    if (editingId) {
      await updateService.mutateAsync({ id: editingId, ...payload });
    } else {
      await createService.mutateAsync(payload);
    }
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: "", duration: 30, price: 0, bufferTime: 10, location: "", isActive: true });
  };

  const openEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      bufferTime: service.bufferTime,
      location: service.location,
      isActive: service.isActive
    });
    setIsOpen(true);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground mt-1">Manage the services you offer to clients.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if(!o) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{editingId ? "Edit Service" : "Add New Service"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. 1-on-1 Consultation" className="rounded-xl h-11" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Input type="number" required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value as any})} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value as any})} className="rounded-xl h-11" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buffer Time (mins)</Label>
                  <Input type="number" required value={formData.bufferTime} onChange={e => setFormData({...formData, bufferTime: e.target.value as any})} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Zoom, Office, etc." className="rounded-xl h-11" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Make this service available for booking</p>
                </div>
                <Switch checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
              </div>

              <Button type="submit" disabled={createService.isPending || updateService.isPending} className="w-full rounded-xl h-11 text-base">
                {editingId ? "Save Changes" : "Create Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)
        ) : services?.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
            <Scissors className="w-12 h-12 mx-auto text-muted mb-4" />
            <p className="text-lg font-medium text-foreground">No services yet</p>
            <p>Create your first service to start accepting bookings.</p>
          </div>
        ) : (
          services?.map(service => (
            <Card key={service.id} className={`group relative border-border/50 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${!service.isActive ? 'opacity-60' : ''}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display font-bold text-lg leading-tight">{service.name}</h3>
                  <button onClick={() => openEdit(service)} className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors opacity-0 group-hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 text-primary/70" />
                    {service.duration} mins <span className="mx-2">•</span> {service.bufferTime}m buffer
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                    {service.location}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="font-bold text-xl text-foreground">${service.price}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${service.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
