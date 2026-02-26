import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Globe } from "lucide-react";
import { useAvailability, useUpdateAvailability } from "@/hooks/use-availability";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Availability() {
  const { data, isLoading } = useAvailability();
  const updateMutation = useUpdateAvailability();

  // Mock initial state if no data
  const [schedule, setSchedule] = useState<Record<string, {active: boolean, start: string, end: string}>>(
    DAYS.reduce((acc, day) => ({
      ...acc, 
      [day]: { active: day !== 'Saturday' && day !== 'Sunday', start: "09:00", end: "17:00" }
    }), {})
  );

  const handleSave = () => {
    updateMutation.mutate({ schedule, timezone: "America/New_York" });
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Availability</h1>
          <p className="text-muted-foreground mt-1">Set your weekly working hours.</p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 px-6 h-11"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border/50 pb-4">
              <CardTitle className="font-display">Weekly Hours</CardTitle>
              <CardDescription>Configure the times you are available for bookings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/30">
              {DAYS.map(day => (
                <div key={day} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${!schedule[day].active ? 'bg-muted/10' : ''}`}>
                  <div className="flex items-center gap-4 w-40">
                    <Switch 
                      checked={schedule[day].active}
                      onCheckedChange={(c) => setSchedule({...schedule, [day]: {...schedule[day], active: c}})}
                    />
                    <Label className={`font-semibold ${schedule[day].active ? 'text-foreground' : 'text-muted-foreground'}`}>{day}</Label>
                  </div>
                  
                  {schedule[day].active ? (
                    <div className="flex items-center gap-3">
                      <select 
                        value={schedule[day].start}
                        onChange={(e) => setSchedule({...schedule, [day]: {...schedule[day], start: e.target.value}})}
                        className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="08:00">08:00 AM</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                      </select>
                      <span className="text-muted-foreground">-</span>
                      <select 
                        value={schedule[day].end}
                        onChange={(e) => setSchedule({...schedule, [day]: {...schedule[day], end: e.target.value}})}
                        className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                        <option value="18:00">06:00 PM</option>
                        <option value="19:00">07:00 PM</option>
                      </select>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic flex-1 text-center sm:text-left sm:pl-8">
                      Unavailable
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="font-display flex items-center text-lg">
                <Globe className="w-5 h-5 mr-2 text-primary" /> Timezone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow">
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                All times will be displayed in this timezone. Clients will see availability converted to their local time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
