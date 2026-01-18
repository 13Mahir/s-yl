import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileCheck,
    Settings,
    Building2,
    Lock,
    LogOut,
} from "lucide-react";

interface ServiceLayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: "Client Dashboard", href: "/provider", icon: LayoutDashboard },
    { name: "Access Requests", href: "/provider/requests", icon: FileCheck },
    { name: "Configuration", href: "/provider/config", icon: Settings },
];

import { useAuth } from "@/context/AuthProvider";

export function ServiceLayout({ children }: ServiceLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Valid role check can be optional here if RequireAuth handles it, 
    // but good for Typescript safety accessing user properties.
    const role = user?.role || "System Portal";

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
            {/* Service Provider Sidebar - Distinct Slate/Institutional Theme */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800 bg-slate-900">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <Building2 className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-100 tracking-tight">ServiceLink</h1>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{role}</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <div className="px-2 mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Management</p>
                    </div>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-indigo-500/10 text-indigo-400 shadow-none border border-indigo-500/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="h-3 w-3 text-slate-400" />
                            <p className="text-xs font-semibold text-slate-300">Secure Environment</p>
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Access is audited and logged.
                        </p>
                        <Link to="/governance" className="block mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 underline">
                            System Policies
                        </Link>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors group"
                    >
                        <LogOut className="h-5 w-5 text-slate-500 group-hover:text-slate-300" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-72 transition-all duration-300">
                <div className="pt-16 lg:pt-0 min-h-screen bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-8 lg:py-10">

                        {/* Role Context Banner */}
                        <div className="mb-8 p-4 rounded-xl border border-indigo-100 bg-white dark:bg-slate-900 shadow-sm flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${role === 'Regulatory Authority' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Signed in as {role}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {role === 'Regulatory Authority'
                                        ? "Access data for verification and compliance purposes only."
                                        : "Access data to deliver approved services based on active consent."}
                                </p>
                            </div>
                        </div>

                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
