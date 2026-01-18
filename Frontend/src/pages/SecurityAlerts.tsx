import { useState } from "react";
import {
  AlertTriangle,
  XCircle,
  Info,
  CheckCircle2,
  Monitor,
  MapPin,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { activeSessions, securityAlerts } from "@/data/dummyData";

const alertIcons = {
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const alertStyles = {
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: "text-warning",
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: "text-destructive",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "text-primary",
  },
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SecurityAlerts() {
  const [alerts, setAlerts] = useState(securityAlerts);
  const [sessions, setSessions] = useState(activeSessions);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const confirmTerminateSession = () => {
    if (sessionToTerminate) {
      setSessions((prev) => prev.filter((session) => session.id !== sessionToTerminate));
      setSessionToTerminate(null);
    }
  };

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-1 mb-8 border-b border-border pb-6">
        <h1 className="page-header">Security Center</h1>
        <p className="page-description mb-0">
          Manage security alerts and active device sessions.
        </p>
      </div>

      {/* Alert Banner for Critical Items */}
      {unacknowledgedCount > 0 && (
        <div
          className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-foreground">
            You have <strong>{unacknowledgedCount}</strong> unacknowledged security{" "}
            {unacknowledgedCount === 1 ? "alert" : "alerts"} that require your attention.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security Alerts */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Security Alerts</h2>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p className="text-muted-foreground">No security alerts requiring attention.</p>
            </div>
          ) : (
            <div className="space-y-3" role="list">
              {alerts.map((alert) => {
                const Icon = alertIcons[alert.type as keyof typeof alertIcons];
                const styles = alertStyles[alert.type as keyof typeof alertStyles];

                return (
                  <div
                    key={alert.id}
                    role="listitem"
                    className={`p-4 rounded-lg border ${styles.bg} ${styles.border} ${alert.acknowledged ? "opacity-60" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`} aria-label={alert.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-foreground">{alert.title}</p>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Dismiss alert"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp}
                          </span>
                          {!alert.acknowledged && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="h-7 text-xs border border-transparent hover:border-border"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Sessions</h2>

          <div className="space-y-3" role="list">
            {sessions.map((session) => (
              <div
                key={session.id}
                role="listitem"
                className={`p-4 rounded-lg border ${session.current
                  ? "border-primary bg-primary/5"
                  : "border-border"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-xs text-primary font-normal">
                            (Current Session)
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {session.location}
                        <span className="text-border" aria-hidden="true">•</span>
                        <span className="font-mono">IP: {session.ip}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Last active: {session.lastActive}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSessionToTerminate(session.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`End session on ${session.device}`}
                    >
                      End Session
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last Login Info */}
      <div className="section-card mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Login History</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Successful Login</p>
            <p className="font-medium text-foreground mt-1">2025-01-17 10:30</p>
            <p className="text-xs text-muted-foreground mt-1">Jaipur, Rajasthan</p>
          </div>
          <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Failed Attempts</p>
            <p className="font-medium text-foreground mt-1">0 in last 30 days</p>
            <div className="flex items-center gap-1.5 mt-1 text-success text-xs font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>No suspicious activity</span>
            </div>
          </div>
          <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password Age</p>
            <p className="font-medium text-foreground mt-1">63 Days</p>
            <p className="text-xs text-muted-foreground mt-1">Changed on 2024-11-15</p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!sessionToTerminate} onOpenChange={(open) => !open && setSessionToTerminate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of this device? The user will need to sign in again to access the account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSessionToTerminate(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmTerminateSession}
            >
              Confirm & End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
