import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, DollarSign, TrendingUp, ArrowUpRight, Scissors } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useBookings } from "@/hooks/use-bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  const recentBookings = bookings?.slice(0, 5) || [];

  const StatCard = ({ title, value, icon: Icon, trend, prefix = "" }: any) => (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-display font-bold text-foreground">
                {prefix}{value?.toLocaleString() || 0}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-emerald-500 font-medium flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            {trend}
          </span>
          <span className="text-muted-foreground ml-2">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Welcome back, Jane 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">Here's what's happening with your business today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Bookings" value={stats?.todayBookings} icon={CalendarDays} trend="+12%" />
          <StatCard title="Upcoming" value={stats?.upcomingBookings} icon={TrendingUp} trend="+4%" />
          <StatCard title="Total Customers" value={stats?.totalBookings} icon={Users} trend="+18%" />
          <StatCard title="Est. Revenue" value={stats?.revenue} icon={DollarSign} prefix="$" trend="+24%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30 px-6 py-5">
              <CardTitle className="text-lg font-display">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookingsLoading ? (
                <div className="p-6 space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-medium">
                          {booking.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{booking.date}</p>
                        <p className="text-sm text-muted-foreground">{booking.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No recent bookings found.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 border-border/50 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all px-4 py-3 rounded-xl font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                <CalendarDays className="w-5 h-5" />
                New Booking
              </button>
              <button className="w-full bg-card border border-border text-foreground hover:bg-secondary transition-all px-4 py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Add Customer
              </button>
              <button className="w-full bg-card border border-border text-foreground hover:bg-secondary transition-all px-4 py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2">
                <Scissors className="w-5 h-5" />
                New Service
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
