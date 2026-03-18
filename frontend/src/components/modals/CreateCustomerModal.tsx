import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomer } from "@/hooks/use-customers";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Loader2, UserPlus, Mail, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCustomerModal({ isOpen, onClose }: CreateCustomerModalProps) {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const createCustomer = useCreateCustomer();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    try {
      await createCustomer.mutateAsync({
        workspaceId: currentWorkspace.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        joinedDate: new Date().toISOString().split('T')[0],
      });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      setFormData({ name: "", email: "", phone: "" });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-8 pb-6 border-b border-primary/10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <DialogHeader className="p-0">
            <DialogTitle className="text-2xl font-display font-bold text-slate-900">Add New Customer</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Enter the customer details to add them to your workspace.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3 flex-col sm:flex-row">
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
              disabled={createCustomer.isPending}
              className="rounded-xl font-bold h-12 flex-1 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              {createCustomer.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
