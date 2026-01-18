import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  User,
  Scale,
  FileCheck,
  History,
  Building2,
  AlertTriangle,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Identity Overview", href: "/citizen/dashboard", icon: User },
  { name: "Consent Center", href: "/citizen/consent", icon: FileCheck },
  { name: "Access Transparency", href: "/citizen/access-log", icon: History },
  { name: "Verified Services", href: "/citizen/services", icon: Building2 },
  { name: "Security Center", href: "/citizen/security", icon: Shield },
  { name: "Settings", href: "/citizen/settings", icon: Settings },
];

import { useAuth } from "@/context/AuthProvider";

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border bg-sidebar-accent/10">
          <div className="p-2 bg-sidebar-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">TrustID</h1>
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 font-semibold">Citizen Identity Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-2 mb-2">
            <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Menu</p>
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
                    ? "bg-sidebar-accent/50 text-sidebar-primary shadow-none"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />}
                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-sidebar-border bg-sidebar-accent/5">
          <Link to="/governance" className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mb-4 px-3">
            <Scale className="h-3 w-3" />
            Platform Governance
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-sm font-bold ${user?.displayName
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
              : "bg-sidebar-primary/20 border-sidebar-primary/10 text-sidebar-primary"
              }`}>
              {user?.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : <User className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.displayName || "Guest User"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate font-mono">
                {user?.identityId || "No Active Session"}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 mt-4 text-sm text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-sidebar-border text-sidebar-foreground shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-sidebar-primary/10 rounded-md">
              <Shield className="h-5 w-5 text-sidebar-primary" />
            </div>
            <span className="font-semibold text-lg tracking-tight">TrustID</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-sidebar border-b border-sidebar-border shadow-2xl animate-accordion-down origin-top">
          <nav className="px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 transition-all duration-300">
        <div className="pt-16 lg:pt-0 min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 lg:py-10">
            {/* Role Context Banner */}
            <div className="mb-8 p-4 rounded-xl border border-dotted border-sidebar-primary/30 bg-sidebar-accent/10 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">
                  Signed in as Citizen (Individual)
                </h2>
                <p className="text-xs text-sidebar-foreground/60 mt-1">
                  You have full control over your data. All actions are consent-based.
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
