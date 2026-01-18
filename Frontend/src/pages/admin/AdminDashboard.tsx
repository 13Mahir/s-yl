
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Building2, MoreHorizontal, CheckCircle2, XCircle, Clock, Gavel, User, FileText, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthProvider";

export function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation(); // Add this
    const { user } = useAuth();
    const [entities, setEntities] = useState<any[]>([]);
    const [cases, setCases] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("entities");

    const [refreshing, setRefreshing] = useState(false);

    // SYNC TABS WITH URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab && ["entities", "cases", "audit", "settings"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const fetchAll = async () => {
        setLoading(true);
        setRefreshing(true);
        const token = sessionStorage.getItem("auth_token");
        try {
            const [resEnt, resCas] = await Promise.all([
                fetch('http://localhost:5001/api/admin/entities', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5001/api/workflows', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const jsonEnt = await resEnt.json();
            const jsonCas = await resCas.json();

            if (jsonEnt.success) setEntities(Array.isArray(jsonEnt.entities) ? jsonEnt.entities : []);
            if (jsonCas.success) setCases(Array.isArray(jsonCas.cases) ? jsonCas.cases : []);

            // Fetch Logs
            const resLogs = await fetch('http://localhost:5001/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } });
            const jsonLogs = await resLogs.json();
            if (jsonLogs.success) setLogs(jsonLogs.logs || []);

            // Fetch Settings
            const resSet = await fetch('http://localhost:5001/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } });
            const jsonSet = await resSet.json();
            if (jsonSet.success) setSettings(jsonSet.settings || []);

        } catch (e) {
            console.error(e);
            setEntities([]);
            setCases([]);
            setLogs([]);
        } finally {
            setTimeout(() => {
                setLoading(false);
                setRefreshing(false);
            }, 600); // Artificial delay for visual feedback
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const token = sessionStorage.getItem("auth_token");
        try {
            const res = await fetch(`http://localhost:5001/api/admin/entity/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            fetchAll();
        } catch (e) {
            console.error(e);
            alert("Failed to update entity status. Please try again.");
        }
    };

    const govAction = async (id: string, action: string) => {
        const token = sessionStorage.getItem("auth_token");
        await fetch(`http://localhost:5001/api/workflows/${id}/${action}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAll();
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Gavel className="h-6 w-6 text-indigo-600" />
                        Root Governance Console
                    </h1>
                    <p className="text-slate-500 mt-1">Manage system entities and critical compliance cases.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchAll} variant="outline" size="sm" disabled={refreshing}>
                        {refreshing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2" />}
                        {refreshing ? "Syncing..." : "Refresh Data"}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white border text-slate-600">
                    <TabsTrigger value="entities" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        <Building2 className="h-4 w-4 mr-2" /> Entity Registry
                    </TabsTrigger>
                    <TabsTrigger value="cases" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        <FileText className="h-4 w-4 mr-2" /> Case Management
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        <Search className="h-4 w-4 mr-2" /> System Logs
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        <AlertOctagon className="h-4 w-4 mr-2" /> Platform Settings
                    </TabsTrigger>
                </TabsList>

                {/* ENTITIES PANEL */}
                <TabsContent value="entities">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">System Entities (Citizens & orgs)</h3>
                            <Badge variant="outline">{entities.length > 0 ? `${entities.length} Registered` : "Registry Offline"}</Badge>
                        </div>
                        <div className="overflow-x-auto">
                            {entities.length === 0 && !loading ? (
                                <div className="p-12 text-center text-slate-500 bg-slate-50/50">
                                    <div className="flex justify-center mb-3">
                                        <Building2 className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h4 className="font-medium text-slate-900">Registry Empty</h4>
                                    <p className="text-sm mt-1">No entities found in the simulation database.</p>
                                    <Button variant="link" onClick={fetchAll} className="mt-2 text-indigo-600">Retry Synchronization</Button>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3">Identity</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Location</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {entities.map(e => (
                                            <tr key={e.unique_id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {e.role === 'Citizen' ? <User className="h-4 w-4 text-slate-400" /> : <Building2 className="h-4 w-4 text-indigo-400" />}
                                                        <div>
                                                            <div className="text-slate-900">{e.full_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{e.unique_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="secondary" className="font-normal">{e.role}</Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{e.address_city}</td>
                                                <td className="px-6 py-4">
                                                    <Badge className={e.status === 'active' ? 'bg-teal-100 text-teal-800 hover:bg-teal-100' : e.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                                                        {e.status === 'active' ? 'Approved' : e.status === 'pending' ? 'Pending Review' : 'Suspended'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {e.role !== 'Regulatory Authority' && e.unique_id !== user?.identityId && (
                                                        <div className="flex justify-end gap-2">
                                                            {e.status === 'pending' && <Button size="sm" className="h-7 bg-teal-600 text-xs" onClick={() => updateStatus(e.unique_id, 'active')}>Approve</Button>}
                                                            {e.status === 'active' && <Button size="sm" variant="outline" className="h-7 text-red-600 border-red-200 text-xs" onClick={() => updateStatus(e.unique_id, 'suspended')}>Suspend</Button>}
                                                            {e.status === 'suspended' && <Button size="sm" variant="outline" className="h-7 text-teal-600 border-teal-200 text-xs" onClick={() => updateStatus(e.unique_id, 'active')}>Re-Activate</Button>}
                                                        </div>
                                                    )}
                                                    {e.unique_id === user?.identityId && (
                                                        <span className="text-xs text-slate-400 italic">Current Session</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* CASES PANEL */}
                <TabsContent value="cases">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Governance Workflow Cases</h3>
                            <Badge variant="outline">{cases.length > 0 ? `${cases.length} Active` : "No Cases"}</Badge>
                        </div>
                        <div className="overflow-x-auto">
                            {cases.length === 0 && !loading ? (
                                <div className="p-12 text-center text-slate-500 bg-slate-50/50">
                                    <div className="flex justify-center mb-3">
                                        <FileText className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h4 className="font-medium text-slate-900">No Active Cases</h4>
                                    <p className="text-sm mt-1">All governance workflows have been processed.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3">Case ID</th>
                                            <th className="px-6 py-3">Type / Domain</th>
                                            <th className="px-6 py-3">Target Citizen</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Governance Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {cases.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{c.type}</div>
                                                    <div className="text-xs text-slate-400">{c.domain || 'General'}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.citizen_identity_id}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={c.status === 'APPROVED' ? 'default' : c.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                        {c.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {c.status === 'SUBMITTED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => govAction(c.id, 'review')}>Review</Button>}
                                                        {c.status === 'UNDER_REVIEW' && (
                                                            <>
                                                                <Button size="sm" className="h-7 bg-teal-600 hover:bg-teal-700 text-xs" onClick={() => govAction(c.id, 'approve')}>Approve</Button>
                                                                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => govAction(c.id, 'reject')}>Reject</Button>
                                                            </>
                                                        )}
                                                        {c.status === 'DRAFT' && <span className="text-xs text-slate-400 italic">Not Submitted</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </TabsContent>
                {/* 3. AUDIT LOGS TAB (New) */}
                <TabsContent value="audit">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">System Audit Trail</h3>
                            <Badge variant="outline" className="font-mono bg-slate-100">Immutable Ledger</Badge>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3">Time</th>
                                        <th className="px-6 py-3">Actor</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">Purpose</th>
                                        <th className="px-6 py-3">Target</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{log.actor_role}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{log.actor_identity_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="text-slate-700">{log.action_type}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]" title={log.purpose}>
                                                {log.purpose}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                                {log.target_identity_id}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                                No audit logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* 4. SETTINGS PANEL (New) */}
                <TabsContent value="settings">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Global System Configuration</h3>
                            <Badge variant="secondary">Active Policy</Badge>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {settings.map((s: any) => (
                                    <div key={s.setting_key} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-colors">
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.description}</div>
                                        <div className="text-lg font-medium text-slate-900 truncate" title={s.setting_value}>{s.setting_value}</div>
                                        <div className="mt-2 text-xs text-slate-400 font-mono">{s.setting_key}</div>
                                        <div className="mt-3 flex justify-end">
                                            <Button variant="ghost" size="sm" className="h-6 text-xs text-indigo-600 hover:text-indigo-700 p-0">Configure</Button>
                                        </div>
                                    </div>
                                ))}
                                {settings.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-slate-400 italic">
                                        No active configuration parameters found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
