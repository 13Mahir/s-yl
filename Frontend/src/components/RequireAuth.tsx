import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
    allowedRoles?: string[];
}

export const RequireAuth = ({ allowedRoles }: RequireAuthProps) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="mt-4 text-sm text-slate-500 font-medium">Verifying Identity...</p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        // Redirect to login, saving the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is signed in but doesn't have permission
        // Redirect to their appropriate dashboard or a 403 page
        // For now, redirect to home/dashboard based on their actual role to be safe
        if (user.role === 'Citizen') return <Navigate to="/" replace />;
        if (user.role === 'Service Provider') return <Navigate to="/provider" replace />;
        if (user.role === 'Government') return <Navigate to="/gov/dashboard" replace />;
        if (['Regulatory Authority', 'Admin'].includes(user.role)) return <Navigate to="/admin" replace />;

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
