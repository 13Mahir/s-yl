import { useState, useEffect } from "react";
import { Search, Users, MoreHorizontal, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function GovCitizenDirectory() {
    const [citizens, setCitizens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchCitizens = async () => {
            setLoading(true);
            const token = sessionStorage.getItem("auth_token");
            try {
                const res = await fetch('http://localhost:5001/api/admin/entities', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    const cits = (Array.isArray(json.entities) ? json.entities : []).filter((e: any) => e.role === 'Citizen');
                    setCitizens(cits);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCitizens();
    }, []);

    const filtered = citizens.filter(c =>
        c.unique_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verified Citizen Directory</h1>
                    <p className="text-slate-500">Registry of verified identities under your jurisdiction.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by Unity ID..."
                        className="pl-9 bg-slate-50 border-none focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Identity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(cit => (
                            <tr key={cit.unique_id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Users className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">Citizen Record</div>
                                            <div className="text-xs text-slate-500 font-mono">{cit.unique_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">Verified</Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{cit.address_city || 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm">View Profile</Button>
                                    <Button variant="ghost" size="sm" className="text-indigo-600">Request Access</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
