import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, ShieldCheck, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export function ServiceRegistration() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [department, setDepartment] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            const newService = {
                id: `SRV-${Math.floor(Math.random() * 10000)}`,
                name,
                type,
                department,
                category,
                status: "Verified", // Admins onboard verified services by default in this demo
                addedOn: new Date().toISOString().split('T')[0],
            };

            // Save to localStorage
            const existing = JSON.parse(localStorage.getItem("mock_services") || "[]");
            localStorage.setItem("mock_services", JSON.stringify([...existing, newService]));

            toast({
                title: "Service Registered",
                description: `${name} has been successfully onboarded.`,
            });

            setLoading(false);
            navigate("/admin");
        }, 1200);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2 text-slate-500 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Registry
                </Button>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register New Service</h1>
                <p className="text-slate-500 mt-1">Onboard a service provider or authority to the platform.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <Label htmlFor="service-name">Service / Entity Name</Label>
                        <Input
                            id="service-name"
                            placeholder="e.g. Metro Water Supply Board"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="type">Entity Type</Label>
                            <Select value={type} onValueChange={setType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Service Provider">Service Provider</SelectItem>
                                    <SelectItem value="Regulatory Authority">Regulatory Authority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Purpose Category</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                                    <SelectItem value="Urban Services">Urban Services</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Finance">Finance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dept">Owning Department</Label>
                        <Input
                            id="dept"
                            placeholder="e.g. Ministry of Urban Development"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-3 mt-6">
                        <Info className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-500">
                            <p className="font-semibold text-slate-700 mb-1">Registration Policy</p>
                            <p>Registering this service allows it to request data from citizens. Access is subject to citizen consent and platform audit policies.</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                            {loading ? (
                                <span>Registering...</span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Register Service
                                </span>
                            )}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
