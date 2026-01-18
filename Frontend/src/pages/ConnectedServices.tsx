import { useState, useEffect } from "react";
import {
  HeartPulse,
  Wheat,
  Building,
  CheckCircle2,
  Lock,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";

export function ConnectedServices() {
  const { user } = useAuth();
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const token = sessionStorage.getItem("auth_token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5001/api/consents/my-active", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setActiveServices(data.consents);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getServiceIcon = (role: string) => {
    if (role === 'Service Provider') return HeartPulse; // Generic for now
    if (role === 'Government') return Building;
    return Lock;
  };

  const getPortalUrl = (service: any) => {
    // Demo logic: Hardcode CGHS URL for Hospital
    if (service.requester_name?.includes("Hospital") || service.requester_role === 'Service Provider') {
      return "https://cghs.mohfw.gov.in/AHIMSG5/hissso/Login";
    }
    return "#";
  };

  return (
    <div>
      <div className="flex flex-col gap-1 mb-8 border-b border-border pb-6">
        <h1 className="page-header">Verified Services</h1>
        <p className="page-description mb-0">
          Control data sharing with verified service providers.
        </p>
      </div>

      <div className="space-y-6">
        {activeServices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed">
            <Lock className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No connected services found.</p>
            <p className="text-xs">Services you approve will appear here.</p>
          </div>
        ) : (
          activeServices.map(service => {
            const Icon = getServiceIcon(service.requester_role);
            const attrs = Array.isArray(service.allowed_attributes) ? service.allowed_attributes : [];
            const portalUrl = getPortalUrl(service);

            return (
              <div key={service.id} className="section-card mb-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">{service.requester_name || service.requester_identity_id}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Active since: {new Date(service.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(portalUrl, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Portal
                  </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Shared Data */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <h3 className="font-medium">Shared Information</h3>
                    </div>
                    <div className="space-y-3">
                      {attrs.map((attr: string) => (
                        <div key={attr} className="flex justify-between text-sm py-1 border-b border-emerald-100/50 last:border-0">
                          <span className="text-slate-600 dark:text-slate-400 capitalize">{attr.replace(/_/g, ' ')}</span>
                          <span className="font-medium text-slate-900 dark:text-slate-200">
                            {/* In real app, we'd fetch actual values, here we just confirm sharing */}
                            Shared
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Protected Data (Generic Placeholder Logic) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4 text-slate-500">
                      <Lock className="h-5 w-5" />
                      <h3 className="font-medium">Other Data (Protected)</h3>
                    </div>
                    <p className="text-sm text-slate-500">
                      This service does NOT have access to your financial records, biometric templates, or unrelated credentials.
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
