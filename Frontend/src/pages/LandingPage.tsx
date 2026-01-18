import { useNavigate } from "react-router-dom";
import { Shield, Lock, FileCheck, Building2, User, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustHeroAnimation } from "@/components/TrustHeroAnimation";
import { AmbientBackground } from "@/components/AmbientBackground";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50">

            {/* --- HERO SECTION --- */}
            <section className="relative pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">

                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50 animate-pulse-slow" />
                    <AmbientBackground />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center flex flex-col items-center">

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Official Government Digital Infrastructure
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 mb-6">
                        TrustID
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-light tracking-wide animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 mb-10 max-w-2xl mx-auto">
                        A Consent-First Digital Identity Platform.
                    </p>

                    <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300 w-full">
                        <Button
                            size="lg"
                            onClick={() => navigate("/login")}
                            className="h-16 px-10 rounded-full text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xl hover:shadow-indigo-500/20 transition-all hover:scale-105 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Enter TrustID <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Button>
                        <p className="text-sm text-slate-400 font-medium tracking-wide">
                            Sign up or sign in — roles are detected automatically
                        </p>
                    </div>

                    {/* Symbolic Trust Animation */}
                    <div className="mt-16 w-full max-w-lg animate-in fade-in zoom-in-95 duration-1000 delay-500">
                        <TrustHeroAnimation />
                        <p className="mt-6 text-sm text-slate-400/80 font-medium tracking-widest uppercase text-center animate-pulse-fade">
                            Trust is formed when consent, purpose, and oversight align.
                        </p>
                    </div>

                    {/* Role Indicators */}
                    <div className="mt-12 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 opacity-60 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Designed For</p>
                        <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">Citizens</span>
                            <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">Organizations</span>
                            <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">Government Authorities</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS (3 STEPS) --- */}
            <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12">

                        {/* Step 1 */}
                        <div className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="absolute -top-6 left-6 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                                <User className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="mt-8 text-xl font-bold text-slate-900 dark:text-white">1. Citizen Owns Data</h3>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Identity Vault Integration</li>
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Attribute-Level Control</li>
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automatic Verify & Sync</li>
                            </ul>
                        </div>

                        {/* Step 2 */}
                        <div className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="absolute -top-6 left-6 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                                <FileCheck className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="mt-8 text-xl font-bold text-slate-900 dark:text-white">2. Consent-Based Access</h3>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Purpose-Bound Requests</li>
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Time-Limited Grants</li>
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Revoke Instantly</li>
                            </ul>
                        </div>

                        {/* Step 3 */}
                        <div className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="absolute -top-6 left-6 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                                <Shield className="h-8 w-8 text-slate-700 dark:text-slate-200" />
                            </div>
                            <h3 className="mt-8 text-xl font-bold text-slate-900 dark:text-white">3. Government Oversight</h3>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Role-Based Access</li>
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Immutable Audit Logs</li>
                                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Regulatory Compliance</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- KEY FEATURES --- */}
            <section className="py-24 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">Built for Trust. Engineered for Security.</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">

                        {[
                            { icon: Lock, title: "Identity Vault", desc: "Modular data blocks for Healthcare, Finance, and Civic data." },
                            { icon: FileCheck, title: "Consent Management", desc: "Granular permission controls. Data is never shared without explicit approval." },
                            { icon: Globe, title: "Government Portals", desc: "Dedicated dashboards for authority oversight and entity verification." },
                            { icon: Building2, title: "Service Integration", desc: "Seamless API for Banks, Hospitals, and Civic bodies to verify citizens." },
                            { icon: Shield, title: "Audit Trails", desc: "Every access request is logged on an immutable ledger for total transparency." },
                            { icon: User, title: "Privacy by Design", desc: "Zero-knowledge proofs and minimal disclosure principles at the core." }
                        ].map((f, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-colors">
                                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 h-fit">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{f.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{f.desc}</p>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </section>

            {/* --- USE CASES --- */}
            <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 font-semibold tracking-wider text-sm uppercase">Real-World Impact</span>
                        <h2 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">Solving Critical Challenges</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border border-blue-100 dark:border-slate-800">
                            <div className="text-4xl mb-4">🏥</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Healthcare</h3>
                            <p className="text-slate-600 dark:text-slate-400">"Hospitals verify allergies and medical info instantly without storing patient data permanently, reducing liability and improving care."</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-slate-950 border border-amber-100 dark:border-slate-800">
                            <div className="text-4xl mb-4">🏙️</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Urban Services</h3>
                            <p className="text-slate-600 dark:text-slate-400">"Instant address verification for utility connections and municipal services, eliminating paperwork and physical visits."</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 border border-emerald-100 dark:border-slate-800">
                            <div className="text-4xl mb-4">🌾</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Agriculture</h3>
                            <p className="text-slate-600 dark:text-slate-400">"Farmers share validated land ownership and soil health data to claim subsidies instantly and securely."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TRUST BANNER --- */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <Shield className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold tracking-tight mb-6">Security is not a feature. It's the foundation.</h2>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-slate-300 font-medium">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Read-Only Verification</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Government Regulated</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Consent-First Architecture</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Immutable Logic</span>
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-24 bg-white dark:bg-slate-900">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Built for citizens. Trusted by governments.</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">Join the future of Digital Identity today.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={() => navigate("/login")} className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            Create Citizen Identity
                        </Button>
                        <Button onClick={() => navigate("/login")} variant="outline" className="h-12 px-8 rounded-full">
                            Organization Sign In
                        </Button>
                        <Button onClick={() => navigate("/login")} variant="ghost" className="h-12 px-8 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white">
                            Government Admin
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-6 w-6 text-indigo-600" />
                            <span className="font-bold text-xl text-slate-900 dark:text-white">TrustID</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                            The official Digital Identity simulation platform enabling secure, consent-driven data exchange between citizens, government bodies, and service providers.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Domains</h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li>Healthcare & Vitals</li>
                            <li>Agriculture & Land</li>
                            <li>Urban Governance</li>
                            <li>Financial Aid</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li>Privacy Policy</li>
                            <li>Government Compliance</li>
                            <li>Developer API</li>
                            <li>Status Page</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <div className="flex gap-4">
                        <p>© 2026 TrustID GovTech Initiative.</p>
                        <p>Hackathon Demo Environment</p>
                    </div>
                    <div className="text-[10px] text-slate-300 dark:text-slate-600 font-medium tracking-wide text-center md:text-right">
                        Created by Team S,YL <span className="mx-1 opacity-30">|</span>
                        <span className="hover:text-slate-400 dark:hover:text-slate-500 transition-colors mx-1">Daksh Shah</span> •
                        <span className="hover:text-slate-400 dark:hover:text-slate-500 transition-colors mx-1"> Mahir Shah</span> •
                        <span className="hover:text-slate-400 dark:hover:text-slate-500 transition-colors mx-1"> Sachi Patel</span> •
                        <span className="hover:text-slate-400 dark:hover:text-slate-500 transition-colors mx-1"> Ansh Patel</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}
