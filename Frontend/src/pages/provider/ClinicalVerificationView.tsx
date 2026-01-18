
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Shield, Clock, AlertTriangle, Lock, FileSearch, User, Activity, AlertOctagon, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthProvider";

interface ClinicalData {
    // Core
    health_id?: string;
    blood_group?: string;

    // History
    known_conditions?: string;
    past_major_illnesses?: string;
    allergies?: string;

    // Meds
    current_medications?: string; // JSON string or text

    // Emergency
    emergency_contact?: string;
    life_threatening_conditions?: string;

    // Vitals
    clinical_height?: string;
    clinical_weight?: string;
    clinical_vitals_date?: string;

    // Meta
    full_name?: string;
    last_verification_date?: string;
}

export function ClinicalVerificationView() {
    const { targetId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth(); // Provider Info

    // Improve: State typing. Expecting consent context passed via navigation
    const consentContext = location.state?.consent || {
        purpose: "Emergency Verification",
        valid_until: "2026-02-15",
        status: "Active"
    };

    const [data, setData] = useState<ClinicalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approvedAttributes, setApprovedAttributes] = useState<string[]>([]);

    useEffect(() => {
        if (!targetId) return;

        const fetchData = async () => {
            const token = sessionStorage.getItem("auth_token");
            try {
                const res = await fetch(`http://localhost:5001/api/citizen/data?target_id=${targetId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 403) {
                    throw new Error("Access Denied: Consent Expired or Revoked.");
                }

                const json = await res.json();
                if (!json.success) throw new Error(json.message);

                setData(json.data);
                setApprovedAttributes(Object.keys(json.data));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [targetId]);

    // --- Render Helpers ---

    const Section = ({ title, icon: Icon, children, isEmpty }: any) => {
        if (isEmpty) return null;
        return (
            <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm relative group">
                {/* Visual Safeguard: Read Only Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] uppercase tracking-wider">
                        <Lock className="h-3 w-3 mr-1" /> Read-Only
                    </Badge>
                </div>

                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-700 dark:text-indigo-400">
                        <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                </div>
                <div className="p-6 relative">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                        <div className="text-2xl font-bold uppercase -rotate-12 whitespace-nowrap">
                            Verified Clinical Access • Consent Bound
                        </div>
                    </div>
                    <div className="relative z-10 grid gap-6 md:grid-cols-2">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    const Attribute = ({ label, value }: { label: string, value?: string }) => {
        if (!value) return null;
        return (
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <div className="text-base font-medium text-slate-900 dark:text-slate-100 font-mono break-words pb-1 border-b border-slate-100 dark:border-slate-800 border-dashed">
                    {value}
                </div>
            </div>
        );
    };

    // --- Parsing Helpers ---
    const formatMeds = (jsonOrStr?: string) => {
        if (!jsonOrStr) return null;
        try {
            const parsed = JSON.parse(jsonOrStr);
            if (Array.isArray(parsed)) {
                return (
                    <div className="col-span-2 space-y-2">
                        {parsed.map((m: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900">{m.name}</p>
                                    <p className="text-xs text-slate-500">Rx: {m.prescriber}</p>
                                </div>
                                <Badge variant="secondary">{m.dosage}</Badge>
                            </div>
                        ))}
                    </div>
                );
            }
        } catch (e) { return jsonOrStr; }
        return jsonOrStr;
    };


    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Establishing Secure Clinical Line...</div>;

    if (error) return (
        <div className="max-w-2xl mx-auto mt-20 p-8 border border-red-200 bg-red-50 rounded-xl text-center">
            <AlertOctagon className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Access Blocked</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <p className="text-sm text-red-600 mb-6">"Healthcare access is no longer available under current consent."</p>
            <Button onClick={() => navigate('/provider')}>Return to Console</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 select-none" onContextMenu={(e) => e.preventDefault()}>

            {/* PART 1: Clinical Context Header (Fixed) */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-indigo-100 dark:border-indigo-900">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-600 text-white rounded-lg shadow-sm">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {data?.full_name || "Unknown Patient"}
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700">Verified Identity</Badge>
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <span className="font-mono">HID: {data?.health_id || "N/A"}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span>Purpose: <span className="font-medium text-indigo-700">{consentContext.purpose}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Consent Validity</p>
                                <div className="flex items-center justify-end gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <Clock className="h-4 w-4 text-emerald-600" />
                                    <span>Valid until {new Date(consentContext.valid_until).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="px-4 py-2 border-l border-slate-200 pl-6">
                                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                                    Verification-Only Mode
                                </Badge>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => navigate('/provider')}>
                                <Undo2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-4 gap-8">

                {/* PART 4: Consent Scope Transparency (Sidebar) */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sticky top-32">
                        <div className="flex items-center gap-2 mb-4 text-indigo-700">
                            <FileSearch className="h-5 w-5" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Consent Scope</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                            Access is strictly limited to the attributes explicitly approved by the citizen.
                        </p>

                        <div className="space-y-2 mb-6">
                            {approvedAttributes.filter(k => !['success', 'message', 'full_name'].includes(k)).map(attr => (
                                <div key={attr} className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    {attr}
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2">
                            <Lock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-800 font-medium">
                                "No other medical data is accessible beyond this scope."
                            </p>
                        </div>
                    </div>
                </div>

                {/* PART 2: Structured Clinical Data */}
                <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">

                    {/* 1. Core Medical Identity */}
                    <Section title="Core Medical Identity" icon={User} isEmpty={!data?.health_id && !data?.blood_group}>
                        <Attribute label="Health Unique ID" value={data?.health_id} />
                        <Attribute label="Blood Group" value={data?.blood_group} />
                        {data?.last_verification_date &&
                            <Attribute label="Last Clinical Verification" value={new Date(data.last_verification_date).toLocaleDateString()} />
                        }
                    </Section>

                    {/* 2. Medical History */}
                    <Section title="Medical History" icon={Activity} isEmpty={!data?.known_conditions && !data?.past_major_illnesses}>
                        <Attribute label="Chronic Conditions" value={data?.known_conditions} />
                        <Attribute label="Past Major Illnesses" value={data?.past_major_illnesses} />
                        <Attribute label="Allergies" value={data?.allergies} />
                    </Section>

                    {/* 3. Medications */}
                    <Section title="Current Medications" icon={Shield} isEmpty={!data?.current_medications}>
                        {formatMeds(data?.current_medications)}
                    </Section>

                    {/* 4. Vitals */}
                    <Section title="Clinical Measurements" icon={Activity} isEmpty={!data?.clinical_height && !data?.clinical_weight}>
                        <Attribute label="Height" value={data?.clinical_height} />
                        <Attribute label="Weight" value={data?.clinical_weight} />
                        <Attribute label="Recorded On" value={data?.clinical_vitals_date ? new Date(data.clinical_vitals_date).toLocaleDateString() : undefined} />
                    </Section>

                    {/* 5. Emergency Info */}
                    <Section title="Emergency Protocol" icon={AlertTriangle} isEmpty={!data?.emergency_contact && !data?.life_threatening_conditions}>
                        <div className="col-span-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <Attribute label="Emergency Contact" value={data?.emergency_contact} />
                        </div>
                        <div className="col-span-2">
                            <Attribute label="Critical Conditions" value={data?.life_threatening_conditions} />
                        </div>
                    </Section>

                    {/* PART 6: Audit Confirmation */}
                    <div className="mt-12 text-center border-t border-slate-200 pt-8">
                        <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                            <Shield className="h-3 w-3" />
                            All access is logged for transparency. Session ID: {Math.random().toString(36).substring(7)}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
