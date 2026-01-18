import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { Loader2 } from "lucide-react";

export const RedirectIfAuthenticated = () => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" /> {/* Minimal loading state */}
            </div>
        );
    }

    if (isAuthenticated && user) {
        // Check role and redirect to dashboard
        if (user.role === 'Citizen') return <Navigate to="/citizen/dashboard" replace />;
        if (user.role === 'Service Provider') return <Navigate to="/provider" replace />;
        if (user.role === 'Regulatory Authority') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
