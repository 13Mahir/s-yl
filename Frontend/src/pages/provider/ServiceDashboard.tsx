import {
    CheckCircle2,
    Shield,
    Clock,
    Ban,
    Lock,
    FileSearch,
    AlertCircle,
    Activity,
    Scale,
    FileText,
    History,
    LayoutDashboard,
    PlusCircle,
    Send,
    FileCheck,
    Users,
    AlertTriangle,
    Filter,
    Eye,
    Gavel,
    AlertOctagon,
    Briefcase,
    Target,
    Zap,
    TrendingUp,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Mock Data - Shared
const authorizedAttributes = [
    { id: "full-name", name: "Full Name", value: "Mahir Shah", verified: true, expiry: "29 days", status: "active" },
    { id: "dob", name: "Date of Birth", value: "1998-05-15", verified: true, expiry: "29 days", status: "active" },
    { id: "email", name: "Email Address", value: "mahir.shah@example.com", verified: true, expiry: "29 days", status: "active" },
];

const unauthorizedAttributes = [
    { id: "address", name: "Home Address", reason: "Explicitly Denied by User", status: "blocked" },
    { id: "phone", name: "Phone Number", reason: "Scope Not Requested", status: "restricted" },
    { id: "financial", name: "Income Data", reason: "Requires Enhanced Clearance", status: "restricted" },
];

// Mock Data - Service Provider (Enhanced)
const mockRequests = [
    { id: 101, type: "Data Access", attributes: ["Home Address"], status: "Pending", date: "Today, 10:30 AM", notes: "Required for physical mail delivery", stage: "Citizen Review" },
    { id: 102, type: "Data Verification", attributes: ["Driving License"], status: "Approved", date: "Yesterday, 2:15 PM", notes: "Annual eligibility check", stage: "Active" },
    { id: 105, type: "Scope Expansion", attributes: ["Health Records"], status: "Draft", date: "Draft saved 2 mins ago", notes: "Pending internal approval", stage: "Internal" },
    { id: 106, type: "Consent Renewal", attributes: ["Full Name", "Email"], status: "Expired", date: "2025-12-15", notes: "Renewal request timed out", stage: "Closed" },
];

const mockLogs = [
    { id: 1, action: "Viewed Record", target: "Mahir Shah", time: "Just now", operator: "System (Auto)" },
    { id: 2, action: "Validation Check", target: "DOB Attribute", time: "1 hour ago", operator: "Officer R. Singh" },
    { id: 3, action: "Token Refresh", target: "Auth Session", time: "2 hours ago", operator: "System (Auto)" },
];

const mockConsentRisks = [
    { service: "Identity Verification", risk: "Low", nearing: 12, impact: "Minimal" },
    { service: "Document Delivery", risk: "Medium", nearing: 5, impact: "Marketing Pause" },
    { service: "Payment Processing", risk: "High", nearing: 2, impact: "Service Stoppage" },
];

// Mock Data - Regulatory Authority (Oversight Enhanced)
const mockGovernanceStats = {
    casesHandled: 842,
    activeConsents: 124,
    deniedAttempts: 15,
    complianceScore: "99.8%"
};

const mockRegulatoryCases = [
    { id: "CASE-2026-001", type: "Compliance Audit", target: "Consent Records #C99", status: "Active", outcome: "Pending Review", date: "Today, 09:00 AM", priority: "High" },
    { id: "CASE-2026-002", type: "Identity Verification", target: "Mahir Shah (Citizen)", status: "Verified", outcome: "Match Confirmed", date: "Jan 12, 2026", priority: "Standard" },
    { id: "CASE-2025-892", type: "Fraud Investigation", target: "Multiple Entities", status: "Closed", outcome: "No Irregularities", date: "Dec 28, 2025", priority: "Critical" },
];

const mockRegulatoryLogs = [
    { id: 3, action: "Access Denied", purpose: "Unauthorized Scope", target: "Financial Records", time: "Yesterday", operator: "System (Policy Enforcer)" },
];

// Mock Data - Projects & Initiatives (New)
const mockServiceProjects = [
    { id: "PRJ-001", name: "Urban Health Drive", domain: "Healthcare", citizens: 12500, consent_health: "98%", risk: "Low", nearing: 12 },
    { id: "PRJ-002", name: "Rural Connectivity", domain: "Infrastructure", citizens: 8200, consent_health: "92%", risk: "Medium", nearing: 145 },
    { id: "PRJ-003", name: "Direct Benefit Transfer", domain: "Finance", citizens: 24000, consent_health: "99%", risk: "Low", nearing: 5 },
];

const mockRegulatoryInitiatives = [
    { id: "INT-2026-Q1", name: "FinTech Compliance Audit", jurisdiction: "Financial Data", cases: 24, status: "In Progress", progress: 65 },
    { id: "INT-2025-Q4", name: "Health Data Privacy Review", jurisdiction: "Healthcare", cases: 12, status: "Completed", progress: 100 },
    { id: "INT-2026-Q2", name: "Telecom Fraud Prevention", jurisdiction: "Telecom", cases: 8, status: "Planned", progress: 0 },
];

export function ServiceDashboard() {
    const role = sessionStorage.getItem("user_role") || "Verified Service Provider";
    const isRegulatory = role === "Regulatory Authority";
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();
    const [sentRequests, setSentRequests] = useState<any[]>([]); // Real state
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Project Management State
    const [projects, setProjects] = useState<any[]>(mockServiceProjects);
    const [initiatives, setInitiatives] = useState<any[]>(mockRegulatoryInitiatives);
    const [showProjectDialog, setShowProjectDialog] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", domain: "" });

    const handleCreateProject = () => {
        if (!newProject.name || !newProject.domain) return;

        const newItem = {
            id: `NEW-${Date.now()}`,
            name: newProject.name,
            domain: newProject.domain,
            jurisdiction: newProject.domain, // for regulatory
            citizens: 0,
            cases: 0,
            consent_health: "100%",
            risk: "Low",
            nearing: 0,
            status: "In Progress",
            progress: 0
        };

        if (isRegulatory) {
            setInitiatives(prevInitiatives => [newItem, ...prevInitiatives]);
        } else {
            setProjects(prevProjects => [newItem, ...prevProjects]);
        }

        setShowProjectDialog(false);
        setNewProject({ name: "", domain: "" });
    };

    // Derived state for "Live Data" (Active Consents)
    const activeConsents = sentRequests.filter(req => req.status === 'active');

    useEffect(() => {
        const fetchAll = async () => {
            const token = sessionStorage.getItem("auth_token");
            if (!token) return;

            try {
                // Fetch Requests (Sent)
                const resReq = await fetch('http://localhost:5001/api/consents/sent', { headers: { 'Authorization': `Bearer ${token}` } });
                const jsonReq = await resReq.json();
                if (jsonReq.success) setSentRequests(jsonReq.requests);

                // Fetch Audit Logs (My Actions)
                const resLogs = await fetch('http://localhost:5001/api/audit/my-actions', { headers: { 'Authorization': `Bearer ${token}` } });
                const jsonLogs = await resLogs.json();
                if (jsonLogs.success) setAuditLogs(jsonLogs.logs);

            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            }
        };

        if (!isRegulatory) {
            fetchAll();
            // Polling
            const interval = setInterval(fetchAll, 5000);
            return () => clearInterval(interval);
        } else {
            // Regulatory specific fetch if needed, but for now reuse
            fetchAll();
        }
    }, [isRegulatory]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Institutional Header */}
            <div className="flex flex-col gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                            <Shield className={`h-8 w-8 ${isRegulatory ? "text-amber-600" : "text-indigo-600"}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {isRegulatory ? "Ministry of Electronics & IT" : "Rajasthan Transport Authority"}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${isRegulatory ? "text-amber-700 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"}`}>
                                    <CheckCircle2 className="h-3 w-3" />
                                    {isRegulatory ? "Verified Regulatory Authority" : "Verified Government Entit"}
                                </span>
                                <span className="text-xs text-slate-500">ID: {isRegulatory ? "GOV-IN-MEITY-01" : "GOV-RJ-TR-2025"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Context Banner */}
                <div className={`p-4 border rounded-lg flex items-start sm:items-center justify-between gap-4 ${isRegulatory ? "bg-amber-50 border-amber-100" : "bg-indigo-50 border-indigo-100"}`}>
                    <div className="flex items-start gap-3">
                        {isRegulatory ? <Scale className="h-5 w-5 text-amber-600 mt-0.5" /> : <Activity className="h-5 w-5 text-indigo-600 mt-0.5" />}
                        <div>
                            <p className={`text-sm font-medium ${isRegulatory ? "text-amber-900" : "text-indigo-900"}`}>
                                {isRegulatory ? "Compliance Oversight Console" : "Service Delivery Operations Console"}
                            </p>
                            <p className={`text-xs mt-1 ${isRegulatory ? "text-amber-700" : "text-indigo-700"}`}>
                                {isRegulatory
                                    ? "Auditing Mode: All actions are legally recorded for compliance verification."
                                    : "Operational Mode: Manage service delivery based on active citizen consents."}
                            </p>
                        </div>
                    </div>
                    {!isRegulatory && (
                        <div className="hidden sm:flex items-center gap-4 text-xs text-indigo-800">
                            <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>Citizens Served: <strong>12,450</strong></span>
                            </div>
                            <div className="w-px h-3 bg-indigo-200" />
                            <div className="flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5" />
                                <span>Active Sessions: <strong>342</strong></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {isRegulatory ? "Regulatory Operations" : "Service Operations"}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isRegulatory ? "Compliance Verification & Oversight" : "Secure Data Access & Case Management"}
                    </p>
                </div>

                {/* COMPLIANCE SNAPSHOT (Read-Only) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex gap-6 text-xs shadow-sm">
                    <div>
                        <p className="text-slate-400 uppercase tracking-wider font-semibold mb-1">Jurisdiction</p>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <Globe className="h-3.5 w-3.5 text-indigo-500" />
                            IND-KA (Karnataka)
                        </div>
                    </div>
                    <div className="w-px bg-slate-100 dark:bg-slate-800" />
                    <div>
                        <p className="text-slate-400 uppercase tracking-wider font-semibold mb-1">Authority</p>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <Shield className="h-3.5 w-3.5 text-emerald-500" />
                            DPDP Act (2023)
                        </div>
                    </div>
                    <div className="w-px bg-slate-100 dark:bg-slate-800" />
                    <div>
                        <p className="text-slate-400 uppercase tracking-wider font-semibold mb-1">Audit Status</p>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <Activity className="h-3.5 w-3.5 text-indigo-500" />
                            {auditLogs.length > 0 ? "Active Logging" : "System Ready"}
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="cases" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="cases" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Case Management
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Active Data Access
                        {activeConsents.length > 0 && (
                            <span className="ml-1 bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {activeConsents.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Compliance Log
                    </TabsTrigger>
                </TabsList>

                {/* 1. CASE MANAGEMENT (Primary View) */}
                <TabsContent value="cases" className="space-y-6">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                            <h3 className="text-lg font-semibold">{isRegulatory ? "Regulatory Case Files" : "Operational Cases"}</h3>
                            <p className="text-sm text-slate-500">
                                {isRegulatory ? "Track open compliance reviews and audits." : "Manage service interactions, consents, and data requests."}
                            </p>
                        </div>

                        <Button
                            className={`flex items-center gap-2 ${isRegulatory ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                            onClick={() => navigate('/provider/requests/new')}
                        >
                            <PlusCircle className="h-4 w-4" /> New Case
                        </Button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold text-nowrap">
                                    <tr>
                                        <th className="px-6 py-4">Case Details</th>
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4">Purpose & Attributes</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Timeline</th>
                                        <th className="px-6 py-4 text-right">Audit Ref</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                                No active cases found. Operations are idle.
                                            </td>
                                        </tr>
                                    ) : (
                                        sentRequests.map((req, idx) => (
                                            <tr key={req.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-xs text-slate-500">#{String(req.id).substring(0, 8).toUpperCase()}</span>
                                                        <span className="font-medium text-slate-900 mt-1">{req.service_type || "General Service"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                            {req.owner_name ? req.owner_name.charAt(0) : "U"}
                                                        </div>
                                                        <div>
                                                            <div className="text-slate-900 font-medium text-xs">{req.owner_name || "Unknown"}</div>
                                                            <div className="font-mono text-[10px] text-slate-400">
                                                                ID: {req.owner_identity_id ? `******${String(req.owner_identity_id).slice(-4)}` : "****"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-[200px]">
                                                        <p className="text-xs text-slate-600 truncate mb-1.5" title={req.purpose}>{req.purpose}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(req.allowed_attributes || []).slice(0, 2).map((attr: string) => (
                                                                <span key={attr} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                                                                    {attr.replace(/_/g, ' ')}
                                                                </span>
                                                            ))}
                                                            {(req.allowed_attributes || []).length > 2 && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded">
                                                                    +{(req.allowed_attributes || []).length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={req.status}>{req.status}</StatusBadge>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    <div>Created: {new Date(req.created_at || Date.now()).toLocaleDateString()}</div>
                                                    {req.valid_until && (
                                                        <div className="text-amber-600 mt-0.5">Exp: {new Date(req.valid_until).toLocaleDateString()}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-mono text-[10px] text-slate-300">
                                                        SHA:{Math.random().toString(36).substring(7).toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* 2. ACTIVE DATA ACCESS (Strictly Live) */}
                <TabsContent value="active" className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                        <div className="bg-emerald-50/50 border-b border-emerald-100 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-emerald-800">
                                <div className="animate-pulse h-2 w-2 rounded-full bg-emerald-500"></div>
                                <h3 className="text-sm font-semibold">Live Data Channels</h3>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-medium">Encrypted • Transient • Audited</span>
                        </div>

                        <div className="relative z-10">
                            {activeConsents.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lock className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-900">No Active Data Channels</h4>
                                    <p className="text-xs text-slate-500 mt-1">Request access via Case Management to establish a data channel.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {activeConsents.map((consent: any) => (
                                        <div key={consent.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px]">
                                                            ACTIVE CHANNEL
                                                        </Badge>
                                                        <span className="text-xs text-slate-400 font-mono">#{consent.id.substring(0, 8)}</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-slate-900">{consent.service_type || "General Service"}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">Subject: {consent.owner_name} (ID: {consent.owner_identity_id})</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                                                        Expires in {Math.ceil((new Date(consent.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Decrypted Data Payload</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(consent.allowed_attributes || []).map((attr: string) => (
                                                        <div key={attr} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded text-xs text-slate-700 shadow-sm">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                                            {attr.replace(/_/g, ' ')}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* 3. AUDIT LOGS (Real Data) */}
                <TabsContent value="audit" className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold">{isRegulatory ? "Internal Compliance Audit" : "Operational Audit Trail"}</h3>
                            <Badge variant="outline" className="text-xs font-mono bg-slate-100">IMMUTABLE LEDGER</Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-4 px-6 py-2 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <div>Action</div>
                            {isRegulatory && <div>Purpose</div>}
                            <div>Target</div>
                            <div>Operator</div>
                            <div className="text-right">Time</div>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {auditLogs.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic text-sm">No recent activity recorded.</div>
                            ) : (
                                auditLogs.map((log: any) => (
                                    <div key={log.id} className={`px-6 py-4 grid ${isRegulatory ? "grid-cols-5" : "grid-cols-4"} gap-4 text-sm`}>
                                        <div className="font-medium text-slate-900 dark:text-white">{log.action_type}</div>
                                        {isRegulatory && <div className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit">{log.purpose}</div>}
                                        <div className="text-slate-500">{log.target_identity_id}</div>
                                        <div className="text-slate-500">{log.actor_role}</div>
                                        <div className="text-right text-slate-400 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Explicit Restrictions Footer - Expanded for Operational/Oversight Responsibility */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">{isRegulatory ? "Oversight Accountability" : "Operational Responsibility"}</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>{isRegulatory ? "Audit Officer" : "Service Operator"}: <strong>{isRegulatory ? "M. Gupta (ID: 8821)" : "Unit 4 (Logistics)"}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>{isRegulatory ? "Last Internal Audit" : "Compliance Officer"}: <strong>{isRegulatory ? "Today, 08:30 AM" : "Verified"}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Activity className="h-3 w-3" />
                                <span>Platform Mode: <strong>Active (Live)</strong></span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 text-right">{isRegulatory ? "Regulatory Safeguards" : "Platform Safeguards"}</p>
                        <div className="flex flex-wrap justify-end gap-4 text-[10px] text-slate-400">
                            {isRegulatory ? (
                                <>
                                    <span className="flex items-center gap-1"><Ban className="h-3 w-3" /> No Bulk Extraction</span>
                                    <span className="flex items-center gap-1"><Ban className="h-3 w-3" /> No Surveillance</span>
                                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Audit Trail Visible</span>
                                </>
                            ) : (
                                <>
                                    <span className="flex items-center gap-1"><Ban className="h-3 w-3" /> No Direct Data Edits</span>
                                    <span className="flex items-center gap-1"><Ban className="h-3 w-3" /> No Consent Overrides</span>
                                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> No Unaudited Access</span>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 italic text-right">
                            {isRegulatory
                                ? "All oversight actions are subject to independent judicial review."
                                : "This service operates under specific citizen consent. All access is logged."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
