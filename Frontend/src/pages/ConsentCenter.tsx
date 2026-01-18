import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { activeConsents, pendingConsentRequest } from "@/data/dummyData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AIConsentAssistant } from "@/components/citizen/AIConsentAssistant";

function calculateDaysRemaining(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function ConsentCenter() {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState("30 Days");
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  // Real Data State
  const [consents, setConsents] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  const token = sessionStorage.getItem("auth_token");

  const fetchData = async () => {
    try {
      const [resReq, resAct] = await Promise.all([
        fetch('http://localhost:5001/api/consents/my-requests', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5001/api/consents/my-active', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const jsonReq = await resReq.json();
      const jsonAct = await resAct.json();

      if (jsonReq.success) {
        setPendingRequests(jsonReq.requests);
      }
      if (jsonAct.success) {
        setConsents(jsonAct.consents);
      }
    } catch (e) {
      console.error("Failed to fetch consents", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const openApproveModal = (req: any) => {
    setActiveRequest(req);
    setSelectedAttributes(req.allowed_attributes);
    setShowConsentModal(true);
  };

  const handleApprove = async () => {
    if (!activeRequest) return;

    try {
      const res = await fetch(`http://localhost:5001/api/consents/${activeRequest.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ duration_days: parseInt(selectedDuration) || 30 })
      });

      if (res.ok) {
        setShowConsentModal(false);
        setActiveRequest(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeny = async () => {
    if (!activeRequest) return;

    try {
      const res = await fetch(`http://localhost:5001/api/consents/${activeRequest.id}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setShowConsentModal(false);
        setActiveRequest(null);
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleRevoke = (id: string) => setRevokeId(id);

  const confirmRevoke = async () => {
    if (!revokeId) return;
    try {
      await fetch(`http://localhost:5001/api/consents/${revokeId}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRevokeId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAttributeToggle = (attrId: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(attrId) ? prev.filter((id) => id !== attrId) : [...prev, attrId]
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-1 mb-8 border-b border-border pb-6">
        <h1 className="page-header">Consent Center</h1>
        <p className="page-description mb-0">
          Review and manage all active data sharing agreements.
        </p>
      </div>

      {/* Consent Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Consents</p>
          <p className="text-2xl font-bold text-foreground mt-1">{consents.length}</p>
        </div>
        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Requests</p>
          <p className={`text-2xl font-bold mt-1 ${pendingRequests.length > 0 ? 'text-indigo-600' : 'text-foreground'}`}>{pendingRequests.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <details className="text-xs text-muted-foreground cursor-pointer group">
          <summary className="flex items-center gap-2 hover:text-foreground transition-colors w-fit p-2 hover:bg-muted rounded-md">
            <Info className="h-4 w-4" />
            <span>How consent works (Lifecycle)</span>
          </summary>
          <div className="mt-3 p-4 border border-border rounded-lg bg-card ml-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">Requested</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-1 rounded bg-primary/10 text-primary">Approved</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-1 rounded bg-success/10 text-success">Active</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-1 rounded bg-warning/10 text-warning">Expiring</span>
            </div>
          </div>
        </details>
      </div>

      {/* Pending Consent Request Modal */}
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg">
                    {activeRequest?.requester_name || "Unknown Requester"}
                  </DialogTitle>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  <span className="font-medium">Requester ID:</span> {activeRequest?.requester_identity_id}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">Purpose of Request</p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeRequest?.purpose}
              </p>
            </div>

            {/* AI Assistant Insight */}
            {activeRequest && (
              <div className="mb-1">
                <AIConsentAssistant
                  request={{
                    id: activeRequest.id,
                    requesterName: activeRequest.requester_name,
                    purpose: activeRequest.purpose,
                    attributes: activeRequest.allowed_attributes,
                    status: 'pending',
                    requestDate: new Date().toISOString(),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  }}
                  compact={true}
                />
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Requested Attributes:
              </p>
              <div className="space-y-2">
                <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded p-2">
                  {activeRequest?.allowed_attributes?.map((attr: string) => (
                    <div key={attr} className="flex items-center justify-between p-2 bg-card border border-border rounded">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={attr}
                          checked={selectedAttributes.includes(attr)}
                          disabled
                        />
                        <Label htmlFor={attr} className="text-sm">
                          {attr}
                        </Label>
                      </div>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        REQUIRED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm font-medium">
                Access Duration
              </Label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger id="duration" className="mt-2">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">3 Months</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDeny}>
              <XCircle className="mr-2 h-4 w-4" />
              Deny
            </Button>
            <Button onClick={handleApprove} disabled={!selectedDuration}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-8 p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
          <h3 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Pending Access Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{req.requester_name}</h4>
                    <p className="text-xs text-slate-500 mb-1">{req.requester_role} • {req.purpose}</p>
                    <div className="flex flex-wrap gap-1">
                      {req.allowed_attributes.slice(0, 3).map((attr: string) => (
                        <span key={attr} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {attr}
                        </span>
                      ))}
                      {req.allowed_attributes.length > 3 && <span className="text-[10px] text-slate-400">+{req.allowed_attributes.length - 3} more</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button size="sm" className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => openApproveModal(req)}>
                    View & Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Consents */}
      <div className="section-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Consents</h2>

        {consents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active consents. Your data is not shared with any service.
          </p>
        ) : (
          <div className="space-y-4">
            {consents.map((consent) => {
              const daysRemaining = calculateDaysRemaining(consent.expiresOn);
              const isExpanded = expandedConsent === consent.id;

              return (
                <div
                  key={consent.id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedConsent(isExpanded ? null : consent.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {consent.requester_name}
                          </p>
                          {consent.status === 'active' && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {consent.requester_role}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {consent.allowed_attributes.length} attributes shared
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={
                              calculateDaysRemaining(consent.valid_until) <= 7 ? "text-warning font-medium" : "text-muted-foreground"
                            }
                          >
                            {calculateDaysRemaining(consent.valid_until)} days remaining
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-4 bg-muted/30">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Purpose</p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {consent.purpose}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {new Date(consent.valid_from).toLocaleDateString()} → {new Date(consent.valid_until).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Shared Attributes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {consent.allowed_attributes.map((attr: string) => (
                            <StatusBadge key={attr} status="shared">
                              {attr}
                            </StatusBadge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevoke(consent.id);
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Revoke Access Immediately
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revocation Confirmation Dialog */}
      <Dialog open={!!revokeId} onOpenChange={(open) => !open && setRevokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Access?</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop sharing data with <span className="font-semibold text-foreground">{consents.find(c => c.id === revokeId)?.requester_name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/40 rounded-lg text-sm text-muted-foreground mb-2">
            <p>This action will:</p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Immediately stop all data sharing</li>
              <li>Invalidate existing access tokens</li>
              <li>Be recorded in your access log</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRevoke}
            >
              Confirm & Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
