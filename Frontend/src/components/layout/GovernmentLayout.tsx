import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    Building2,
    Users,
    FileText,
    Shield,
    ShieldAlert,
    LogOut,
    Landmark
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

interface GovernmentLayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: "Dashboard", href: "/gov/dashboard", icon: LayoutGrid },
    { name: "Org Oversight", href: "/gov/orgs", icon: Building2 },
    { name: "Verified Citizens", href: "/gov/citizens", icon: Users },
    { name: "Case Management", href: "/gov/cases", icon: FileText },
    { name: "Data Access", href: "/gov/consents", icon: Shield },
    { name: "Audit Logs", href: "/gov/logs", icon: ShieldAlert },
];

export function GovernmentLayout({ children }: GovernmentLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Extract domain from user role or metadata if available
    // For now, hardcode or display Generic
    const domain = "Healthcare Domain";

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
            {/* Sidebar - Slate/Indigo Theme */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800 bg-slate-900">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <Landmark className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-100 tracking-tight">TrustID Authority</h1>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{domain}</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <div className="px-2 mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jurisdiction</p>
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
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-semibold text-slate-300">Node Active</p>
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Logged in as {user?.displayName}
                        </p>
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 lg:py-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
