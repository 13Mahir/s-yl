import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, CheckCircle2, XCircle, FileSearch, ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AIExplanationEngine } from "@/utils/AIExplanationEngine";

interface Request {
    id: string;
    purpose: string;
    status: "Pending" | "Active" | "Denied";
    attributes: string[];
    timestamp: string;
}

export function ServiceRequestList() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<Request[]>([]);

    useEffect(() => {
        // Load requests from "network" (mock)
        const stored = JSON.parse(localStorage.getItem("mock_pending_requests") || "[]");
        // Also simulate "Active" ones if we had a consolidated store, but for now pending is fine to visualize the create flow.
        // In a real app we'd fetch all requests. Let's just show the mock pending queue + some static ones for flavor.

        // Merge mock static history
        const history: Request[] = [
            { id: "REQ-1029", purpose: "Service Delivery", status: "Active", attributes: ["full_name"], timestamp: "2025-10-12T10:00:00Z" },
            { id: "REQ-0012", purpose: "Compliance Audit", status: "Denied", attributes: ["financial_summary"], timestamp: "2025-09-01T14:30:00Z" }
        ];

        setRequests([...stored, ...history]);
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Requests</h1>
                    <p className="text-slate-500 mt-1">Manage and track data access requests to citizens.</p>
                </div>
                <Button onClick={() => navigate("/provider/requests/new")} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FileSearch className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="font-semibold text-slate-900 mb-1">No Requests Found</h3>
                        <p className="text-sm">You haven't initiated any access requests yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {requests.map((req) => (
                            <div key={req.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg border ${req.status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                        req.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                            'bg-red-50 border-red-100 text-red-600'
                                        }`}>
                                        {req.status === 'Pending' ? <Clock className="h-5 w-5" /> :
                                            req.status === 'Active' ? <CheckCircle2 className="h-5 w-5" /> :
                                                <XCircle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-slate-400">#{req.id}</span>
                                            <h3 className="font-semibold text-slate-900">{req.purpose}</h3>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Requested {req.attributes.length} attributes • {new Date(req.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={
                                        req.status === 'Pending' ? 'pending' :
                                            req.status === 'Active' ? 'active' : 'denied'
                                    }>{req.status}</StatusBadge>

                                    {req.status === 'Denied' && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="link"
                                                    className="text-xs text-indigo-600 h-auto p-0 underline decoration-dotted decoration-indigo-300"
                                                >
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    Why am I seeing this?
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
                                                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
                                                    <Bot className="w-4 h-4 text-indigo-600" />
                                                    <span className="text-xs font-semibold text-indigo-900">AI Explanation</span>
                                                </div>
                                                <div className="p-4 bg-white">
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        {AIExplanationEngine.explainAccessDecision('denied', 'scope')}
                                                    </p>
                                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">System Insight</p>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    <Button variant="ghost" size="icon" className="text-slate-400">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
