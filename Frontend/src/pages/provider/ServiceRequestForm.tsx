import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Shield, Calendar, FileText, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export function ServiceRequestForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const role = sessionStorage.getItem("user_role") || "Verified Service Provider";

    // Form State
    const [targetId, setTargetId] = useState("");
    const [serviceType, setServiceType] = useState("");
    const [duration, setDuration] = useState("");
    const [justification, setJustification] = useState("");
    const [attributes, setAttributes] = useState<string[]>([]);

    const token = sessionStorage.getItem("auth_token");

    const attributeOptions = [
        { id: "full_name", label: "Full Name" },
        { id: "dob", label: "Date of Birth" },
        { id: "address_city", label: "Address (City)" },
        { id: "email", label: "Email Address" },
        { id: "health_id", label: "Health ID" },
        { id: "blood_group", label: "Blood Group" },
        { id: "allergies", label: "Allergies" },
        { id: "current_medications", label: "Current Medications" },
        { id: "emergency_contact", label: "Emergency Contact" },
    ];

    const handleAttributeToggle = (id: string, checked: boolean) => {
        if (checked) {
            setAttributes([...attributes, id]);
        } else {
            setAttributes(attributes.filter((attr) => attr !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (attributes.length === 0) {
            toast({
                title: "No Attributes Selected",
                description: "Please select at least one data attribute to request.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/consents/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    citizen_identity_id: targetId,
                    purpose: justification, // Use the detailed text as the main purpose/description
                    service_type: serviceType, // Send the category as service_type
                    requested_attributes: attributes,
                    duration_days: duration === "1 Year" ? 365 : duration === "30 Days" ? 30 : 1 // Simple mapping
                })
            });

            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Case Created",
                    description: "Consent request sent to citizen. Case is now PENDING.",
                    duration: 5000,
                });
                navigate("/provider");
            } else {
                toast({
                    title: "Request Failed",
                    description: data.message || "Could not submit request.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: "Network error occurred.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" size="sm" onClick={() => navigate("/provider")} className="gap-2 text-slate-500 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Request Data Access</h1>
                <p className="text-slate-500 mt-1">Initiate a formal request for citizen identity data.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Identity Context */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-4">
                        <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                            <Shield className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requesting As</p>
                            <p className="font-medium text-slate-900">{role}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-amber-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Request will be audited and visible to the citizen.</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="targetId">Citizen Mobile / Unique ID</Label>
                            <Input
                                id="targetId"
                                placeholder="e.g. 9876543210"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceType">Service Case Type</Label>
                            <Select value={serviceType} onValueChange={setServiceType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select case category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Service Delivery">Service Delivery</SelectItem>
                                    <SelectItem value="Identity Verification">Identity Verification</SelectItem>
                                    <SelectItem value="Regulatory Compliance">Regulatory Compliance</SelectItem>
                                    <SelectItem value="Clinical Assessment">Clinical Assessment</SelectItem>
                                    <SelectItem value="Benefit Distribution">Benefit Distribution</SelectItem>
                                    <SelectItem value="Emergency Access">Emergency Access</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Access Duration</Label>
                            <Select value={duration} onValueChange={setDuration} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Validity period..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="One-time Access">One-time Access (Snapshot)</SelectItem>
                                    <SelectItem value="30 Days">30 Days</SelectItem>
                                    <SelectItem value="1 Year">1 Year</SelectItem>
                                    <SelectItem value="Until Revoked">Until Revoked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="justification">Justification (Visible to Citizen)</Label>
                        <Textarea
                            id="justification"
                            placeholder="E.g. Required to verify driver's license eligibility..."
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            required
                            className="resize-none h-24"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Requested Attributes</Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {attributeOptions.map((attr) => (
                                <div key={attr.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors">
                                    <Checkbox
                                        id={attr.id}
                                        checked={attributes.includes(attr.id)}
                                        onCheckedChange={(c) => handleAttributeToggle(attr.id, c as boolean)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={attr.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {attr.label}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Only request minimal data necessary for the service.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    Testing Connection...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Submit Request <Send className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
