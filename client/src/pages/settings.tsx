import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Palette, Bell, Link as LinkIcon } from "lucide-react";

export default function Settings() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your organization and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary p-1 rounded-xl inline-flex w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="profile" className="rounded-lg px-6 py-2"><Building2 className="w-4 h-4 mr-2"/> Profile</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-lg px-6 py-2"><Palette className="w-4 h-4 mr-2"/> Branding</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6 py-2"><Bell className="w-4 h-4 mr-2"/> Notifications</TabsTrigger>
          <TabsTrigger value="booking" className="rounded-lg px-6 py-2"><LinkIcon className="w-4 h-4 mr-2"/> Booking Page</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in">
          <Card className="max-w-2xl border-border/50 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="font-display">Organization Profile</CardTitle>
              <CardDescription>Update your business details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input defaultValue="Appointify Inc." className="h-11 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input defaultValue="hello@appointify.com" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+1 (555) 000-0000" className="h-11 rounded-xl" />
                </div>
              </div>
              <Button className="mt-4 rounded-xl h-11">Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="animate-in">
          <Card className="max-w-2xl border-border/50 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="font-display">Branding</CardTitle>
              <CardDescription>Customize how your booking page looks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Brand Color</Label>
                <div className="flex gap-3">
                  {['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-rose-600', 'bg-slate-900'].map((color, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:scale-110 transition-transform ${color} ${i===1 ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}></div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input placeholder="https://..." className="h-11 rounded-xl" />
              </div>
              <Button className="rounded-xl h-11">Update Branding</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Empty states for other tabs to keep it complete but brief */}
        <TabsContent value="notifications" className="animate-in">
          <Card className="max-w-2xl border-border/50 rounded-2xl p-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted" />
            <h3 className="text-lg font-medium text-foreground mb-2">Notification Settings</h3>
            <p>Configure email and SMS reminders here.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="booking" className="animate-in">
          <Card className="max-w-2xl border-border/50 rounded-2xl p-8">
            <Label className="mb-2 block">Your Public Booking Link</Label>
            <div className="flex gap-2">
              <Input readOnly value="https://appointify.com/book/acme" className="h-11 rounded-xl bg-muted/50 font-mono text-sm" />
              <Button variant="secondary" className="h-11 rounded-xl">Copy</Button>
            </div>
            <Button className="mt-6 rounded-xl h-11 w-full" onClick={() => window.open('/book/acme', '_blank')}>
              Preview Public Page
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
