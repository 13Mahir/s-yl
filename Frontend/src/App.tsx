import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegistrationPage } from "@/pages/RegistrationPage";
import { IdentityOverview } from "@/pages/IdentityOverview";
import { ConsentCenter } from "@/pages/ConsentCenter";
import { AccessTransparency } from "@/pages/AccessTransparency";
import { ConnectedServices } from "@/pages/ConnectedServices";
import { SecurityAlerts } from "@/pages/SecurityAlerts";
import { SettingsPage } from "@/pages/SettingsPage";
import { ServiceConfiguration } from "@/pages/provider/ServiceConfiguration";
import { ServiceLayout } from "@/components/layout/ServiceLayout";
import { ServiceDashboard } from "./pages/provider/ServiceDashboard";

import { ServiceRequestList } from "./pages/provider/ServiceRequestList";
import { ServiceRequestForm } from "./pages/provider/ServiceRequestForm";
import { ClinicalVerificationView } from "@/pages/provider/ClinicalVerificationView";

import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ServiceRegistration } from "./pages/admin/ServiceRegistration";
import { GovernancePage } from "./pages/GovernancePage";
import { AuthProvider } from "./context/AuthProvider";
import { RequireAuth } from "./components/RequireAuth";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";
import { GovernmentDashboard } from "./pages/gov/GovernmentDashboard";
import { GovernmentLayout } from "./components/layout/GovernmentLayout";
import { GovOrgOversight } from "./pages/gov/GovOrgOversight";
import { GovCitizenDirectory } from "./pages/gov/GovCitizenDirectory";
import { GovCaseManagement } from "./pages/gov/GovCaseManagement";
import { GovConsentControl } from "./pages/gov/GovConsentControl";
import { GovAuditLogs } from "./pages/gov/GovAuditLogs";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<RedirectIfAuthenticated />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
            </Route>

            <Route path="/governance" element={<GovernancePage />} />

            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Citizen Routes - Protected */}
            <Route element={<RequireAuth allowedRoles={['Citizen']} />}>
              <Route
                path="/citizen/dashboard"
                element={
                  <AppLayout>
                    <IdentityOverview />
                  </AppLayout>
                }
              />
              <Route
                path="/citizen/consent"
                element={
                  <AppLayout>
                    <ConsentCenter />
                  </AppLayout>
                }
              />
              <Route
                path="/citizen/access-log"
                element={
                  <AppLayout>
                    <AccessTransparency />
                  </AppLayout>
                }
              />
              <Route
                path="/citizen/services"
                element={
                  <AppLayout>
                    <ConnectedServices />
                  </AppLayout>
                }
              />
              <Route
                path="/citizen/security"
                element={
                  <AppLayout>
                    <SecurityAlerts />
                  </AppLayout>
                }
              />
              <Route
                path="/citizen/settings"
                element={
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                }
              />
            </Route>

            {/* Service Provider Routes - Protected */}
            <Route element={<RequireAuth allowedRoles={['Service Provider']} />}>
              <Route
                path="/provider/*"
                element={
                  <ServiceLayout>
                    <Routes>
                      <Route index element={<ServiceDashboard />} />
                      <Route path="requests" element={<ServiceRequestList />} />
                      <Route path="requests/new" element={<ServiceRequestForm />} />
                      <Route path="clinical-view/:targetId" element={<ClinicalVerificationView />} />

                      // ... previous code ...

                      <Route path="config" element={<ServiceConfiguration />} />
                    </Routes>
                  </ServiceLayout>
                }
              />
            </Route>



            {/* Government Routes - Protected & Scoped */}
            <Route element={<RequireAuth allowedRoles={['Government']} />}>
              <Route
                path="/gov/*"
                element={
                  <GovernmentLayout>
                    <Routes>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<GovernmentDashboard />} />
                      <Route path="orgs" element={<GovOrgOversight />} />
                      <Route path="citizens" element={<GovCitizenDirectory />} />
                      <Route path="cases" element={<GovCaseManagement />} />
                      <Route path="consents" element={<GovConsentControl />} />
                      <Route path="logs" element={<GovAuditLogs />} />
                    </Routes>
                  </GovernmentLayout>
                }
              />
            </Route>

            {/* Admin Routes - Protected (ROOT ONLY) */}
            <Route element={<RequireAuth allowedRoles={['Regulatory Authority', 'Admin']} />}>
              <Route
                path="/admin/*"
                element={
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                    </Routes>
                  </AdminLayout>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
