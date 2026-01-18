import { useState, useEffect } from "react";
import { Shield, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function GovConsentControl() {
    const [registrations, setRegistrations] = useState<any[]>([]);

    useEffect(() => {
        const fetchConsents = async () => {
            const token = sessionStorage.getItem("auth_token");
            try {
                const res = await fetch('http://localhost:5001/api/consents/sent', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) setRegistrations(Array.isArray(json.requests) ? json.requests : []);
            } catch (e) { console.error(e); }
        }
        fetchConsents();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Access & Consents</h1>
                <p className="text-slate-500">Audit and manage data access requests initiated by this authority.</p>
            </div>

            <div className="space-y-4">
                {registrations.map(req => (
                    <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">{req.purpose}</span>
                                <Badge className={
                                    req.status === 'granted' ? 'bg-emerald-100 text-emerald-700' :
                                        req.status === 'revoked' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                }>{req.status}</Badge>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                Target: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{req.owner_name || 'Citizen'}</span>
                                <span className="mx-2">•</span>
                                <Clock className="inline h-3 w-3 mr-1" />
                                {new Date(req.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
                {registrations.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <Shield className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No active data access requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
