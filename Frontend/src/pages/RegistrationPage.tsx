import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Shield, ArrowRight, Loader2, Lock, CheckCircle2,
    Calendar, MapPin, User, HeartPulse, Wheat, Building,
    ChevronLeft, ChevronRight, Check
} from "lucide-react";

export function RegistrationPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const [mobile, setMobile] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Mandatory
        fullName: "",
        dob: "",
        gender: "",
        city: "",
        state: "",
        // Health (Optional)
        healthId: "",
        bloodGroup: "",
        // Agriculture (Optional)
        farmerId: "",
        landType: "",
        // Civic (Optional)
        cityId: "",
        utilityRef: ""
    });

    useEffect(() => {
        if (location.state?.mobile) {
            setMobile(location.state.mobile);
        } else {
            // Allow dev bypass or redirect
            // navigate("/login");
            if (process.env.NODE_ENV === 'development') setMobile("9999999999");
        }
    }, [location, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [error, setError] = useState<string | null>(null);

    // Step 1 Validation
    const isStep1Valid =
        formData.fullName.trim().length > 2 &&
        formData.dob !== "" &&
        formData.gender !== "" &&
        formData.city.trim().length > 2 &&
        formData.state.trim().length > 2;

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStep1Valid) return;

        setLoading(true);
        setError(null);


        try {
            const response = await fetch('http://localhost:5001/api/auth/register-citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile,
                    fullName: formData.fullName.trim(),
                    dob: formData.dob,
                    gender: formData.gender,
                    city: formData.city.trim(),
                    state: formData.state.trim()
                })
            });

            const data = await response.json();

            // Treat success OR duplicate user as a valid entry
            const isDuplicate = data.message && (
                data.message.toLowerCase().includes("exist") ||
                data.message.toLowerCase().includes("duplicate")
            );

            if (data.success || isDuplicate) {
                // Set session immediately using Global Auth
                if (data.session_token) {
                    login(data.session_token, {
                        identityId: mobile,
                        role: "Citizen",
                        displayName: formData.fullName.trim(),
                        status: "active"
                    }, false); // false = Don't redirect yet, let them finish wizard
                }

                // Allow user to proceed to optional steps
                setStep(2);
            } else {
                setError("We couldn’t complete setup right now. Please try again.");
            }
        } catch (err) {
            setError("We couldn’t complete setup right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const saveOptionalData = () => {
        // Save to LocalStorage to simulate adding to Vault
        const vaultData = [];

        if (formData.healthId || formData.bloodGroup) {
            vaultData.push({ category: 'healthcare', items: { healthId: formData.healthId, bloodGroup: formData.bloodGroup } });
        }
        if (formData.farmerId || formData.landType) {
            vaultData.push({ category: 'agriculture', items: { farmerId: formData.farmerId, landType: formData.landType } });
        }
        if (formData.cityId || formData.utilityRef) {
            vaultData.push({ category: 'cityServices', items: { cityId: formData.cityId, utilityRef: formData.utilityRef } });
        }

        if (vaultData.length > 0) {
            localStorage.setItem(`pending_vault_${mobile}`, JSON.stringify(vaultData));
        }
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleSkip = () => {
        setStep(prev => prev + 1);
    };

    const handleFinish = () => {
        saveOptionalData();
        // Global Auth state should already be set from Step 1
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden py-10">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]" />
            </div>

            <div className="w-full max-w-lg relative z-10 animate-in slide-in-from-bottom-5 duration-500">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 mb-4">
                        <Shield className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {step === 1 ? "Secure Identity Setup" : "Enhance Your Profile"}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        {step === 1 ? "Please provide accurate details for your verified profile." : "Add optional credentials to your vault."}
                    </p>
                </div>

                {/* Progress Bar (Steps 2-4) */}
                {step > 1 && step < 5 && (
                    <div className="mb-6 flex gap-2">
                        {[2, 3, 4].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                )}

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 sm:p-8">

                    {/* Step 1: Mandatory */}
                    {step === 1 && (
                        <form onSubmit={handleStep1Submit} className="space-y-6">
                            <div className="mb-6 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div className="text-xs">
                                        <p className="text-slate-500 font-medium">Verified Mobile</p>
                                        <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">{mobile}</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                    Verified
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></Label>
                                    {formData.fullName.trim().length > 2 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        placeholder="As per official documents"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`h-11 pl-10 ${formData.fullName.trim().length > 0 && formData.fullName.trim().length <= 2 ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                                        disabled={loading}
                                    />
                                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                </div>
                            </div>

                            {/* DOB & Gender */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                                        {formData.dob && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="dob"
                                            name="dob"
                                            type="date"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className="h-11 pl-10"
                                            disabled={loading}
                                            max={new Date().toISOString().split("T")[0]}
                                        />
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                                        {formData.gender && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    </div>
                                    <select
                                        id="gender"
                                        name="gender"
                                        className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="" disabled>Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                                        {formData.city.trim().length > 2 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="h-11 pl-10"
                                            disabled={loading}
                                        />
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                                        {formData.state.trim().length > 2 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    </div>
                                    <Input
                                        id="state"
                                        name="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="h-11"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-2 items-start animate-in slide-in-from-top-2">
                                    <div className="mt-0.5 min-w-[16px]">
                                        <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className={`w-full h-12 text-base shadow-lg transition-all ${isStep1Valid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'}`}
                                    disabled={loading || !isStep1Valid}
                                    title={!isStep1Valid ? "Please complete all required fields" : "Register"}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Setup"}
                                    {!loading && <ArrowRight className="h-5 w-5 ml-2" />}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Healthcare */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30">
                                    <HeartPulse className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Healthcare Profile</h3>
                                    <p className="text-sm text-slate-500">Optional • Link your medical history</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>National Health ID (ABHA)</Label>
                                    <Input name="healthId" value={formData.healthId} onChange={handleChange} placeholder="XX-XXXX-XXXX-XXXX" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="">Select (Optional)</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={handleSkip} className="flex-1 text-slate-500">Skip</Button>
                                <Button onClick={handleNext} className="flex-1">Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Agriculture */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                                    <Wheat className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Farmer Profile</h3>
                                    <p className="text-sm text-slate-500">Optional • For agricultural subsidies</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Kisan ID / Farmer ID</Label>
                                    <Input name="farmerId" value={formData.farmerId} onChange={handleChange} placeholder="KID-XXXXX" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Landholding Type</Label>
                                    <select name="landType" value={formData.landType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="">Select (Optional)</option>
                                        <option value="Owner">Owner</option>
                                        <option value="Tenant">Tenant</option>
                                        <option value="Sharecropper">Sharecropper</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={handleSkip} className="flex-1 text-slate-500">Skip</Button>
                                <Button onClick={handleNext} className="flex-1">Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Civic */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800">
                                    <Building className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Urban Services</h3>
                                    <p className="text-sm text-slate-500">Optional • Billing and utilities</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>City Resident ID</Label>
                                    <Input name="cityId" value={formData.cityId} onChange={handleChange} placeholder="CID-XXXX" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Electricity Consumer No.</Label>
                                    <Input name="utilityRef" value={formData.utilityRef} onChange={handleChange} placeholder="REF-XXXX" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={handleSkip} className="flex-1 text-slate-500">Skip</Button>
                                <Button onClick={handleNext} className="flex-1">Review <ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {step === 5 && (
                        <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
                            <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <Check className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">You're All Set!</h2>
                            <p className="text-slate-500">
                                Your Basic Identity is registered. Any optional details you added have been securely placed in your Personal Vault.
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-left space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Name</span>
                                    <span className="font-medium">{formData.fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Identity ID</span>
                                    <span className="font-medium font-mono">{mobile}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Optional Sections</span>
                                    <span className="font-medium">
                                        {[formData.healthId, formData.farmerId, formData.cityId].filter(Boolean).length} Added
                                    </span>
                                </div>
                            </div>

                            <Button onClick={handleFinish} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg shadow-xl">
                                Enter Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </div>
                    )}

                </div>

                {/* Footer Step Indicator */}
                {step < 5 && (
                    <p className="text-center text-[10px] text-slate-400 mt-6">
                        Step {step} of 4 • {step === 1 ? "Mandatory Registration" : "Optional Enhancement"}
                    </p>
                )}
            </div>
        </div>
    );
}
