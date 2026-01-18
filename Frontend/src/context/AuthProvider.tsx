import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
    identityId: string;
    role: string;
    displayName: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string, user: User, shouldNavigate?: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initAuth = async () => {
            const token = sessionStorage.getItem("auth_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://localhost:5001/api/session/identity", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.identity);
                    } else {
                        console.warn("Session check failed:", data.message);
                        sessionStorage.clear();
                    }
                } else {
                    console.warn("Session expired or invalid");
                    sessionStorage.clear();
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (token: string, newUser: User, shouldNavigate = true) => {
        sessionStorage.setItem("auth_token", token);
        setUser(newUser);

        if (shouldNavigate) {
            // Intelligent Redirect based on Role
            if (newUser.role === 'Citizen') navigate("/citizen/dashboard");
            else if (newUser.role === 'Service Provider') navigate("/provider");
            else if (newUser.role === 'Government') navigate("/gov/dashboard");
            else if (['Regulatory Authority', 'Admin'].includes(newUser.role)) navigate("/admin");
            else navigate("/");
        }
    };

    const logout = () => {
        sessionStorage.clear();
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
