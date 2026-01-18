import { useState, useEffect } from "react";
import { Search, Building2, MoreHorizontal, CheckCircle2, XCircle, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function GovOrgOversight() {
    const [entities, setEntities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Create Org Form State
    const [newOrg, setNewOrg] = useState({ name: "", id: "", city: "" });

    const fetchEntities = async () => {
        setLoading(true);
        const token = sessionStorage.getItem("auth_token");
        try {
            const res = await fetch('http://localhost:5001/api/admin/entities', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                // Filter only Organizations
                const orgs = (Array.isArray(json.entities) ? json.entities : []).filter((e: any) => e.role === 'Service Provider' || e.role === 'Organization');
                setEntities(orgs);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntities();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const token = sessionStorage.getItem("auth_token");
        try {
            await fetch(`http://localhost:5001/api/admin/entity/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            fetchEntities();
        } catch (e) {
            console.error(e);
            alert("Action failed.");
        }
    };

    const handleCreateOrg = async () => {
        // Mock creation - in real app would POST to /api/admin/create-entity
        alert(`Request to create ${newOrg.name} sent to registry.`);
        // Optimistic update for demo
        setEntities(prev => [{
            unique_id: newOrg.id || `ORG-${Math.floor(Math.random() * 1000)}`,
            full_name: newOrg.name,
            role: 'Service Provider',
            status: 'pending',
            address_city: newOrg.city,
            created_at: new Date().toISOString()
        }, ...prev]);
    };

    const filtered = entities.filter(e =>
        e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        e.unique_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Organization Oversight</h1>
                    <p className="text-slate-500">Monitor and regulate service providers within the jurisdiction.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" /> Register Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Organization</DialogTitle>
                            <DialogDescription>
                                Government-initiated registration bypasses the public queue.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Organization Name</Label>
                                <Input placeholder="e.g. City General Hospital" value={newOrg.name} onChange={e => setNewOrg({ ...newOrg, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Official ID (Optional)</Label>
                                <Input placeholder="e.g. ORG-HEALTH-001" value={newOrg.id} onChange={e => setNewOrg({ ...newOrg, id: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>City / Jurisdiction</Label>
                                <Input placeholder="e.g. Ahmedabad" value={newOrg.city} onChange={e => setNewOrg({ ...newOrg, city: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateOrg}>Complete Registration</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Toolbar */}
            <div className="flex gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search organizations by name or ID..."
                        className="pl-9 bg-slate-50 border-none focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon"><Filter className="h-4 w-4 text-slate-500" /></Button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Organization</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(org => (
                            <tr key={org.unique_id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Building2 className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{org.full_name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{org.unique_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={org.status === 'active' ? 'outline' : 'secondary'} className={
                                        org.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            org.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' : ''
                                    }>
                                        {org.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{org.address_city}</td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => updateStatus(org.unique_id, 'active')}>Verify / Activate</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => updateStatus(org.unique_id, 'suspended')}>Suspend License</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
