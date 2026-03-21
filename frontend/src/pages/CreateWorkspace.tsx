import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Loader2, Globe, DollarSign } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";

export default function CreateWorkspace() {
    const navigate = useNavigate();
    const { addWorkspace } = useWorkspace();
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const slug = name.toLowerCase().replace(/ /g, "-");
            await addWorkspace({ 
                name, 
                slug, 
                currency: "USD", 
                timezone: "UTC",
                description: null,
                logo: null,
                ownerId: null,
                theme: null
            });
            navigate("/dashboard");
        } catch (err) {
            alert("Failed to create workspace");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create a Workspace</h1>
                    <p className="text-slate-500 font-medium">Workspaces are where you manage your team, services, and bookings.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Workspace Name</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Acme Corp"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 opacity-50">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Currency</label>
                                <div className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 font-bold text-sm">
                                    <DollarSign className="w-4 h-4" />
                                    <span>USD</span>
                                </div>
                            </div>
                            <div className="space-y-2 opacity-50">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Timezone</label>
                                <div className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 font-bold text-sm">
                                    <Globe className="w-4 h-4" />
                                    <span>UTC</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !name}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? "Creating..." : "Create Workspace"}
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <button 
                    onClick={() => navigate(-1)}
                    className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Nevermind, go back
                </button>
            </div>
        </div>
    );
}
