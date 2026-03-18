import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { User, Mail, Shield, Smartphone, MapPin, Loader2, Save, X, Edit2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MyProfile() {
    const { user, isLoading } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || ""
            });
        }
    }, [user]);

    const updateProfile = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await apiRequest("PATCH", "/api/me", data);
            return res.json();
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["/api/user"], updatedUser);
            queryClient.invalidateQueries({ queryKey: ["/api/me"] });
            setIsEditing(false);
            toast({
                title: "Profile Updated",
                description: "Your profile information has been saved.",
            });
        },
        onError: () => {
            toast({
                title: "Update Failed",
                description: "There was an error updating your profile.",
                variant: "destructive"
            });
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">My Profile</h1>
                    <p className="text-slate-500 font-medium">Manage your personal settings</p>
                </div>
                {!isEditing ? (
                    <Button 
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    name: user?.name || "",
                                    phone: user?.phone || ""
                                });
                            }}
                            className="rounded-xl font-bold"
                            disabled={updateProfile.isPending}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => updateProfile.mutate(formData)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold px-6"
                            disabled={updateProfile.isPending}
                        >
                            {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white border text-card-foreground rounded-[2rem] overflow-hidden shadow-sm">
                <div className="h-32 bg-gradient-to-r from-[#5E48B8] to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px", opacity: 0.2 }} />
                </div>
                <div className="px-8 pb-10">
                    <div className="relative flex justify-between items-end -mt-12 mb-8">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl relative group">
                            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black overflow-hidden uppercase">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="space-y-1">
                                {isEditing ? (
                                    <Input 
                                        className="text-2xl font-black text-slate-900 h-12 bg-slate-50 border-slate-200 mt-2 mb-2"
                                        value={formData.name ?? ""}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h3 className="text-2xl font-black text-slate-900">{user?.name}</h3>
                                )}
                                <p className="text-[#5E48B8] font-bold inline-flex px-3 py-1 bg-indigo-50 rounded-lg text-sm">{user?.role}</p>
                            </div>
                            
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 text-slate-600 group">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-[#5E48B8] border border-slate-100 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                                        <span className="font-bold text-slate-900">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600 group">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-[#5E48B8] border border-slate-100 transition-colors">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</span>
                                        {isEditing ? (
                                            <Input 
                                                className="h-10 border-slate-200 bg-slate-50 mt-1 font-medium"
                                                value={formData.phone ?? ""}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                placeholder="e.g. +1 234 567 890"
                                            />
                                        ) : (
                                            <span className="font-bold text-slate-900">{user?.phone || "Not provided"}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 border border-slate-100 h-fit">
                            <h4 className="font-black text-xs uppercase tracking-widest text-[#5E48B8] flex items-center gap-2">
                                <Shield className="w-4 h-4" /> 
                                Account Security
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold text-slate-900">Password</span>
                                        <span className="text-xs font-medium text-slate-400">Last changed 30 days ago</span>
                                    </div>
                                    <Button variant="outline" className="text-xs font-black uppercase rounded-xl h-9 hover:bg-slate-50">Change</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
