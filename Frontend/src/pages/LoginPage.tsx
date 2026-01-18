import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { Shield, ArrowRight, LayoutDashboard, Database, Lock, Fingerprint, Building2, Eye, Loader2, Timer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("auth");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  // Unified State
  const [identityId, setIdentityId] = useState("");
  const [credential, setCredential] = useState(""); // Password for Entities
  const [otp, setOtp] = useState(""); // OTP for Citizens
  const [twoFactorCode, setTwoFactorCode] = useState(""); // 2FA Code for Entities

  // OTP State (Citizen)
  const [isMobile, setIsMobile] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // 2FA State (Entities)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [pendingEntityRole, setPendingEntityRole] = useState<{ role: string, id: string, type: string } | null>(null);

  // Check identifier type
  useEffect(() => {
    setIsMobile(/^\d{10}$/.test(identityId.trim()));
    if (!/^\d{10}$/.test(identityId.trim())) {
      if (otpSent) {
        setOtpSent(false);
        setOtp("");
        setError("");
      }
    }
  }, [identityId, otpSent]);

  // Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const sendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: identityId.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setOtpTimer(120);
        setNotification({
          message: `DEMO MODE: Your OTP is ${data.demo_otp}`,
          type: 'success'
        });
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(`Request Failed: ${err.message || 'Unknown Network Error'}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: identityId.trim(),
          otp: otp
        })
      });

      const data = await response.json();

      if (data.success) {
        // Check if user exists
        const checkResponse = await fetch('http://localhost:5001/api/auth/check-citizen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: identityId.trim() })
        });
        const checkData = await checkResponse.json();

        if (checkData.exists) {
          // Success - Use AuthProvider Login
          login(data.session_token, {
            identityId: data.user.unique_id, // Session ID
            role: data.user.role,
            displayName: data.user.name,
            status: "active"
          });

        } else {
          // Redirect to Registration
          navigate("/register", { state: { mobile: identityId.trim() } });
        }
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendTwoFactor = async (role: string, id: string, type: 'SERVICE' | 'GOV') => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/send-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor_id: id, actor_type: type })
      });
      const data = await response.json();
      if (data.success) {
        setPendingEntityRole({ role, id, type });
        setRequiresTwoFactor(true);
        setNotification({
          message: `DEMO MODE: Verification Code is ${data.demo_code}`,
          type: 'info'
        });
      } else {
        setError("Failed to initiate verification.");
      }
    } catch (err) {
      setError("Network error sending 2FA.");
    }
  };

  const verifyTwoFactor = async () => {
    if (!pendingEntityRole) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor_id: pendingEntityRole.id, code: twoFactorCode.toUpperCase() })
      });

      const data = await response.json();

      if (data.success) {
        // UNIFIED LOGIN FLOW
        login(data.session_token, {
          identityId: data.user.unique_id,
          role: data.user.role,
          displayName: data.user.name,
          status: "active"
        });

      } else {
        setError(data.message || "Invalid code.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Entity Login now resolves identity properly
  const handleEntityLogin = async (id: string) => {
    setLoading(true);
    setTimeout(() => {
      if (credential.length < 4) {
        setError("We couldn’t identify this account. Please check your details.");
        setLoading(false);
        return;
      }

      const upperId = id.toUpperCase();
      // Regex checks are good for determining TYPE, but actual auth happens in verifyTwoFactor/backend
      if (/^(ORG-|SERVICE-)/.test(upperId)) {
        sendTwoFactor("Verified Service Provider", upperId, 'SERVICE');
      } else if (/^(GOV-|AUTHORITY-)/.test(upperId)) {
        sendTwoFactor("Regulatory Authority", upperId, 'GOV');
      } else if (upperId.startsWith("ADM-")) {
        // If you have a specific Admin flow, you can keep it, but ideally it should also use 2FA or Password check
        // For now, assuming Admin also uses the unified flow or falls back to standard 2FA if supported by backend.
        // Since backend doesn't explicitly separate 'ADM' in verify-2fa but relies on users table, 
        // we can treat it as GOV or just generic 'SERVICE' for the sake of 2FA trigger if 'ADM' isn't a special type in 'two_factor_sessions'.
        // Let's assume ADM uses GOV channel for now or just generic 2FA.
        sendTwoFactor("Regulatory Authority", upperId, 'GOV');
      } else {
        setError("We couldn’t identify this account. Please check your details.");
      }
      setLoading(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotification(null);

    if (requiresTwoFactor) {
      verifyTwoFactor();
      return;
    }

    if (isMobile) {
      if (otpSent) verifyOtp();
      else sendOtp();
    } else {
      handleEntityLogin(identityId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Unified Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            TrustID Access Portal
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Secure Unified Entry Point
          </p>
        </div>

        <div className={`bg-white dark:bg-slate-900 border ${requiresTwoFactor ? "border-indigo-200 shadow-indigo-100" : "border-slate-200"} dark:border-slate-800 rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300`}>

          <form onSubmit={handleSubmit} className="space-y-6">

            {!requiresTwoFactor && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="identity" className="text-slate-700 dark:text-slate-300">
                    Access ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="identity"
                      placeholder="Mobile / Organization ID / Admin ID"
                      value={identityId}
                      onChange={(e) => setIdentityId(e.target.value)}
                      className="h-11 font-mono text-sm pl-10"
                      disabled={loading || otpSent}
                      autoFocus
                    />
                    <Fingerprint className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Citizens use Mobile Number. Entities use issued ID.
                  </p>
                </div>

                {/* Entity Password Input */}
                {!isMobile && identityId.length > 3 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="cred" className="text-slate-700 dark:text-slate-300">
                      Security Credential
                    </Label>
                    <div className="relative">
                      <Input
                        id="cred"
                        type="password"
                        placeholder="Access Key"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        className="h-11 font-mono text-sm pl-10"
                        disabled={loading}
                      />
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                )}

                {/* Citizen OTP Input */}
                {isMobile && otpSent && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="otp" className="text-slate-700 dark:text-slate-300">
                        Verification Code
                      </Label>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="otp"
                        type="password"
                        placeholder="XXXXXX"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="h-11 font-mono text-sm pl-10 tracking-widest"
                        disabled={loading}
                      />
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={otpTimer > 0 || loading}
                        className="text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Entity 2FA Screen */}
            {requiresTwoFactor && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-2 rounded-full bg-indigo-50 text-indigo-600 mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Institutional Verification</h3>
                  <p className="text-xs text-slate-500 mt-1">Please enter the secondary verification code sent to your registered terminal.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="2fa" className="text-slate-700 dark:text-slate-300">
                    Verification Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="2fa"
                      placeholder="XXXXXX"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="h-11 font-mono text-center text-lg tracking-widest uppercase"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-center text-slate-400">
                    Code expires in 5 minutes.
                  </p>
                </div>
              </div>
            )}

            {notification && (
              <div className={`p-3 rounded-lg border flex items-start gap-2 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'} animate-in fade-in slide-in-from-top-1`}>
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium">{notification.message}</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2 text-red-600 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {requiresTwoFactor ? "Verifying Code..." : "Processing..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {requiresTwoFactor ? "Confirm & Access Console" :
                    (isMobile ? (otpSent ? "Verify & Sign In" : "Send Verification Code") : "Secure Sign In")}
                  {!requiresTwoFactor && <ArrowRight className="h-4 w-4" />}
                </span>
              )}
            </Button>

            {requiresTwoFactor && (
              <button
                type="button"
                onClick={() => { setRequiresTwoFactor(false); setTwoFactorCode(""); setError(""); setNotification(null); }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 mt-2"
              >
                Cancel Verification
              </button>
            )}

          </form>

        </div>

        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-900/50 py-1.5 px-3 rounded-full inline-flex mx-auto">
            <Lock className="h-3 w-3" />
            Access level determined at authentication.
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-indigo-600 font-medium pt-2">
            <a href="/governance" className="hover:underline">Platform Governance & Rules</a>
          </div>
          <p className="text-[10px] text-slate-400 pt-2">
            Protected by government-grade encryption. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
