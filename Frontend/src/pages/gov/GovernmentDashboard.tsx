import { useState, useEffect } from "react";
import { Building2, Users, FileText, Shield, Activity, TrendingUp, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { AIRiskInsights } from "@/components/gov/AIRiskInsights";
import { AIAssistantChat } from "@/components/AIAssistantChat";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function GovernmentDashboard() {
    const [stats, setStats] = useState({
        activeCases: 0,
        activeConsents: 0,
        pendingRequests: 0,
        orgs: 0,
        citizens: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const token = sessionStorage.getItem("auth_token");
            try {
                // Parallel Fetch
                const [resEnt, resCas, resCon] = await Promise.all([
                    fetch('http://localhost:5001/api/admin/entities', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:5001/api/workflows', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:5001/api/consents/sent', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const [ent, cas, con] = await Promise.all([resEnt.json(), resCas.json(), resCon.json()]);

                const entities = ent.success ? ent.entities : [];
                const cases = cas.success ? cas.cases : [];
                const consents = con.success ? con.requests : [];

                setStats({
                    activeCases: cases.filter((c: any) => c.status === 'active').length,
                    activeConsents: consents.filter((c: any) => c.status === 'granted').length,
                    pendingRequests: consents.filter((c: any) => c.status === 'pending').length,
                    orgs: entities.filter((e: any) => e.role === 'Service Provider' && e.status === 'active').length,
                    citizens: entities.filter((e: any) => e.role === 'Citizen').length
                });

                // Mock Activity Stream from data
                const activity = [
                    ...cases.slice(0, 2).map((c: any) => ({ type: 'case', msg: `New case: ${c.workflow_type}`, time: '2h ago' })),
                    ...consents.slice(0, 2).map((c: any) => ({ type: 'consent', msg: `Consent ${c.status}: ${c.purpose}`, time: '4h ago' }))
                ];
                setRecentActivity(activity);

            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Governance Command Center</h1>
                <p className="text-slate-500 mt-2">Real-time overview of healthcare domain operations.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                        <FileText className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeCases}</div>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1 text-emerald-500" />
                            {stats.activeCases > 0 ? "Requires attention" : "All cleared"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
                        <Shield className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeConsents}</div>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                            +12% from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registered Org.</CardTitle>
                        <Building2 className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.orgs}</div>
                        <p className="text-xs text-slate-500 mt-1">Verified providers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified Citizens</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.citizens}</div>
                        <p className="text-xs text-slate-500 mt-1">In jurisdiction</p>
                    </CardContent>
                </Card>
            </div>





            {/* Recent Activity & Node Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Immediate Action Required</CardTitle>
                        <CardDescription>Pending requests and high-priority alerts.</CardDescription>
                    </CardHeader>
                    {/* ... existing card content ... */}
                    <CardContent>
                        {stats.pendingRequests > 0 ? (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <div>
                                    <h4 className="font-semibold text-amber-900">{stats.pendingRequests} Pending Consent Request(s)</h4>
                                    <p className="text-sm text-amber-700">Service providers await approval for data access.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <CheckCircle2 className="h-8 w-8 text-slate-300 mb-2" />
                                <p>No immediate actions pending.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* AI Insights Panel */}
                    <AIRiskInsights stats={stats} activityLog={recentActivity} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Node Status</CardTitle>
                            <CardDescription>System health check</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Verification Service</span>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Consent Ledger</span>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Synced</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Audit Trail</span>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Logging</Badge>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Recent Activity</h4>
                                <div className="space-y-3">
                                    {recentActivity.map((act, i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <div className="mt-0.5 h-2 w-2 rounded-full bg-slate-300 transform translate-y-1" />
                                            <div>
                                                <p className="text-slate-900 font-medium">{act.msg}</p>
                                                <p className="text-xs text-slate-400">{act.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && <p className="text-xs text-slate-400">No recent activity.</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AIAssistantChat context={{
                role: 'Government Authority',
                domain: 'Healthcare',
                active_consents: stats.activeConsents,
                recent_events: recentActivity.map(a => a.msg)
            }} />
        </div>
    );
}

// Icon for empty state

