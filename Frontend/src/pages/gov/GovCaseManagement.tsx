import { useState, useEffect } from "react";
import { FileText, Plus, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function GovCaseManagement() {
    const [cases, setCases] = useState<any[]>([]);

    useEffect(() => {
        const fetchCases = async () => {
            const token = sessionStorage.getItem("auth_token");
            try {
                const res = await fetch('http://localhost:5001/api/workflows', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) setCases(Array.isArray(json.cases) ? json.cases : []);
            } catch (e) { console.error(e); }
        }
        fetchCases();
    }, []);

    const handleCreateCase = () => {
        alert("Case creation backend integration pending. (Mock success)");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Case Management</h1>
                    <p className="text-slate-500">Manage regulatory workflows and compliance tickets.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" /> Open New Case
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Initiate Regulatory Case</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Subject Entity ID</Label>
                                <Input placeholder="e.g. ORG-123" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Case Type</Label>
                                <Input placeholder="e.g. Compliance Audit" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateCase}>Create Case</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Case ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Current Step</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {cases.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 font-mono text-xs">{c.id}</td>
                                <td className="px-6 py-4 font-medium">{c.workflow_type}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline">{c.status}</Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{c.step_name}</td>
                            </tr>
                        ))}
                        {cases.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No active cases found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
