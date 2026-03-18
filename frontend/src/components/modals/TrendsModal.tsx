import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, ArrowUpRight, Calendar, DollarSign, Users } from "lucide-react";

interface TrendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const data = [
  { name: 'Mon', bookings: 4, revenue: 240, customers: 2 },
  { name: 'Tue', bookings: 7, revenue: 420, customers: 5 },
  { name: 'Wed', bookings: 5, revenue: 300, customers: 3 },
  { name: 'Thu', bookings: 8, revenue: 480, customers: 6 },
  { name: 'Fri', bookings: 12, revenue: 720, customers: 9 },
  { name: 'Sat', bookings: 9, revenue: 540, customers: 7 },
  { name: 'Sun', bookings: 6, revenue: 360, customers: 4 },
];

export default function TrendsModal({ isOpen, onClose }: TrendsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-8 pb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-3xl font-display font-bold text-white tracking-tight">Booking Trends</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium text-lg mt-2">
                An overview of your workspace performance over the last 7 days.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-8 -mt-8 bg-white rounded-t-[2.5rem] relative z-20 space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bookings</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-900">51</span>
                <span className="text-xs font-bold text-emerald-500 mb-1 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +18%
                </span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-900">$3,060</span>
                <span className="text-xs font-bold text-emerald-500 mb-1 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +24%
                </span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Clients</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-900">36</span>
                <span className="text-xs font-bold text-emerald-500 mb-1 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +12%
                </span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '12px 16px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBookings)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
