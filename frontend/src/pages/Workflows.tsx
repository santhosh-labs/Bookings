import { useState } from "react";
import { Plus, HelpCircle, Activity, Mail, MessageSquare, RefreshCcw, Loader2, Trash2 } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow } from "../hooks/use-workflows";

export default function Workflows() {
    const { currentWorkspace, workspaces } = useWorkspace();
    const { data: workflows = [], isLoading } = useWorkflows(currentWorkspace?.id);
    const { mutateAsync: createWorkflow } = useCreateWorkflow();
    const { mutateAsync: deleteWorkflow } = useDeleteWorkflow();
    
    const [activeTab, setActiveTab] = useState("Email Workflows");
    const [isCreating, setIsCreating] = useState(false);

    if (workspaces.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">No Workspaces Found</h2>
                <p className="text-gray-500 max-w-sm">Please create a workspace to view its workflows.</p>
            </div>
        );
    }

    if (isCreating) {
        return (
            <CreateWorkflow 
                workspaceId={currentWorkspace?.id || 1} 
                onCreated={() => setIsCreating(false)} 
                onBack={() => setIsCreating(false)} 
            />
        );
    }

    const filteredWorkflows = workflows.filter(w => {
        if (activeTab === "Email Workflows") return w.type === "email";
        if (activeTab === "SMS Workflows") return w.type === "sms";
        return w.type === "webhook";
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Workflows</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Workflow
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex gap-8 border-b border-gray-200">
                {["Email Workflows", "SMS Workflows", "Custom Workflows"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === tab ? "text-gray-900" : "text-gray-500 hover:text-gray-800"}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                </div>
            ) : filteredWorkflows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {filteredWorkflows.map(workflow => (
                        <div key={workflow.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    workflow.type === 'email' ? 'bg-rose-50 text-rose-500' : 
                                    workflow.type === 'sms' ? 'bg-yellow-50 text-yellow-600' : 'bg-sky-50 text-sky-500'
                                }`}>
                                    {workflow.type === 'email' ? <Mail className="w-5 h-5" /> : 
                                     workflow.type === 'sms' ? <MessageSquare className="w-5 h-5" /> : <RefreshCcw className="w-5 h-5" />}
                                </div>
                                <button 
                                    onClick={() => deleteWorkflow(workflow.id)}
                                    className="p-2 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{workflow.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{workflow.trigger.replace('_', ' ')}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${workflow.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                    {workflow.isActive ? 'Active' : 'Paused'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center pt-10">
                    <div className="mb-6 w-32 h-32 bg-[#f8f7fa] rounded-full flex items-center justify-center relative border border-gray-100 shadow-sm">
                        <Activity className="w-12 h-12 text-[#a29bca]" />
                        <div className="absolute -top-1 -right-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No workflows have been created.</h2>
                    <p className="text-gray-500 mb-6 font-medium">Automate emails, SMS messages, and custom function execution.</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Workflow
                    </button>
                </div>
            )}
        </div>
    );
}

function CreateWorkflow({ workspaceId, onCreated, onBack }: { workspaceId: number, onCreated: () => void, onBack: () => void }) {
    const { mutateAsync: createWorkflow, isPending } = useCreateWorkflow();
    
    const handleTemplateAction = async (name: string, type: string, trigger: string, settings: any) => {
        await createWorkflow({
            workspaceId,
            name,
            type,
            trigger,
            settings,
            isActive: true
        });
        onCreated();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 relative">
                <h1 className="text-2xl font-bold text-gray-900 mx-auto">How would you like to create your workflow?</h1>
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium text-sm absolute right-0">
                    Cancel
                </button>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                    { id: 'ty_email', name: 'Send Thank You Email', type: 'email', trigger: 'after_booking', bg: 'bg-rose-50', icon: Mail },
                    { id: 'fb_email', name: 'Send Feedback Email', type: 'email', trigger: 'after_booking', bg: 'bg-yellow-50', icon: Mail },
                    { id: 'fu_email', name: 'Send Follow-up Email', type: 'email', trigger: 'reminder', bg: 'bg-sky-50', icon: RefreshCcw },
                    { id: 'ty_sms', name: 'Send Thank You SMS', type: 'sms', trigger: 'after_booking', bg: 'bg-rose-50', icon: MessageSquare },
                    { id: 'fb_sms', name: 'Send Feedback SMS', type: 'sms', trigger: 'after_booking', bg: 'bg-yellow-50', icon: MessageSquare },
                    { id: 'fu_sms', name: 'Send Follow-up SMS', type: 'sms', trigger: 'reminder', bg: 'bg-sky-50', icon: RefreshCcw },
                ].map((item) => (
                    <button 
                        key={item.id}
                        disabled={isPending}
                        onClick={() => handleTemplateAction(item.name, item.type, item.trigger, { template: 'Default' })}
                        className="bg-white border border-gray-200 hover:border-orange-300 rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow transition-all group"
                    >
                        <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity`}>
                            <item.icon className="w-6 h-6 text-gray-900" />
                        </div>
                        <span className="font-bold text-gray-800">{item.name}</span>
                        {isPending && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
                    </button>
                ))}
            </div>

            <div className="text-center pt-8 space-y-4">
                <p className="text-gray-600 font-medium">Not looking for any of these workflows?</p>
                <button className="text-gray-900 font-medium hover:underline text-sm uppercase tracking-wide">
                    Create new workflow
                </button>
            </div>
        </div>
    );
}
