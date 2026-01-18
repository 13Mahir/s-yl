import { Shield, Scale, Lock, Eye, FileBadge, Ban, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function GovernancePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-slate-500 mb-6">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <Scale className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Governance</h1>
                            <p className="text-slate-500 mt-1">The constitution of the TrustID ecosystem.</p>
                        </div>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        These policies apply uniformly to all users, services, and authorities. They are immutable system guarantees designed to protect individual rights and ensure neutrality.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">

                {/* Section 1: Core Guarantees */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        Core Guarantees
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Neutrality</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                The platform operates without bias. It does not prioritize any entity or agenda.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Fairness</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Rules apply equally to Citizens, Service Providers, and Regulatory Authorities.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Transparency</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                All actions are logged. Audit trails are visible to relevant parties.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Immutable Policies */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <FileBadge className="h-5 w-5 text-indigo-600" />
                        Immutable Policies
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4">
                            <Lock className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Consent Enforcement</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    No data is shared without explicit individual consent. Consent must be deliberate, specific, and revocable at any time.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4">
                            <Eye className="h-6 w-6 text-amber-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Data Minimization</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Services may only request the minimum data necessary for a specific purpose. Excessive data collection is prohibited.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4">
                            <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Audit & Accountability</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Every data access request, approval, and denial is cryptographically logged. Logs are immutable and enable full accountability.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Limits of Power */}
                <section className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Ban className="h-5 w-5 text-red-600" />
                        Limits of Authority
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
                        To protect trust, the governance layer is strictly limited. The platform:
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2" />
                            CANNOT approve or deny consent on behalf of a citizen.
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2" />
                            CANNOT view private citizen data attributes (only metadata).
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2" />
                            CANNOT bypass audit logs for any reason.
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2" />
                            CANNOT grant emergency access without individual authorization.
                        </li>
                    </ul>
                </section>

                <div className="text-center text-sm text-slate-400 pt-8 border-t border-slate-200 dark:border-slate-800">
                    TrustID Platform Governance v1.0 • Enforcement is Automated & Immutable
                </div>

            </div>
        </div>
    );
}
