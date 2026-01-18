import { useState, useEffect } from "react";
import { Building2, Save, Shield, Globe, Mail, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

export function ServiceConfiguration() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Mock Profile State (simulating fetched org data)
    const [orgProfile, setOrgProfile] = useState({
        name: "City General Hospital",
        id: "ORG-HEALTH-01",
        domain: "Healthcare",
        email: "admin@cityhospital.com",
        webhookUrl: "https://api.cityhospital.com/webhooks/trustid",
        notifications: true
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Configuration Saved",
                description: "Organization settings have been updated.",
            });
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Configuration</h1>
                    <p className="text-slate-500 mt-1">Manage organization profile and integration settings.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex gap-1 items-center">
                        <Shield className="h-3 w-3" /> Verified Organization
                    </Badge>
                </div>
            </div>

            <div className="grid gap-8">
                {/* 1. Organization Profile (Read-Only Core) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Building2 className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-slate-900">Organization Profile</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <div className="relative">
                                <Input value={orgProfile.name} disabled className="bg-slate-50 pl-9" />
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-[10px] text-slate-500">Official registered name. Contact regulatory authority to update.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Organization ID</Label>
                            <div className="relative">
                                <Input value={orgProfile.id} disabled className="bg-slate-50 pl-9 font-mono" />
                                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Service Domain</Label>
                            <Input value={orgProfile.domain} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Contact Email</Label>
                            <div className="relative">
                                <Input
                                    value={orgProfile.email}
                                    onChange={(e) => setOrgProfile({ ...orgProfile, email: e.target.value })}
                                    className="pl-9"
                                />
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Technical Integration */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="h-5 w-5 text-slate-600" />
                        <h2 className="font-semibold text-slate-900">Integration Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Webhook URL (Consent Events)</Label>
                            <Input
                                value={orgProfile.webhookUrl}
                                onChange={(e) => setOrgProfile({ ...orgProfile, webhookUrl: e.target.value })}
                                placeholder="https://"
                            />
                            <p className="text-[11px] text-slate-500">We will send POST requests to this URL when consent status changes (Approved/Revoked). Signature validation required.</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="space-y-0.5">
                                <Label className="text-base">Real-time Notifications</Label>
                                <p className="text-xs text-slate-500">Receive email alerts for critical compliance events.</p>
                            </div>
                            <Switch
                                checked={orgProfile.notifications}
                                onCheckedChange={(c) => setOrgProfile({ ...orgProfile, notifications: c })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 w-32">
                        {loading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
