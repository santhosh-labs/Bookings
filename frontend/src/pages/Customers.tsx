import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Calendar, UserPlus } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateCustomerModal from "../components/modals/CreateCustomerModal";

export default function Customers() {
  const { data: customers, isLoading } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = customers?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">View and manage your client base.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 bg-white border-slate-200 rounded-xl h-12 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4 mr-2 stroke-[3px]" />
            New Customer
          </Button>
        </div>
      </div>

      <CreateCustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           [1,2,3,4,5,6].map(i => (
             <Card key={i} className="h-40 rounded-2xl border-border animate-pulse bg-muted/20" />
           ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No customers found.
          </div>
        ) : (
          filtered.map(customer => (
            <Card key={customer.id} className="border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl group- transition-transform">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">{customer.name}</h3>
                    <p className="text-sm text-primary font-medium flex items-center mt-1">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {customer.totalBookings} past bookings
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2.5 pt-4 border-t border-border/40">
                  <a href={`mailto:${customer.email}`} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 mr-3" />
                    {customer.email}
                  </a>
                  <a href={`tel:${customer.phone}`} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 mr-3" />
                    {customer.phone}
                  </a>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
