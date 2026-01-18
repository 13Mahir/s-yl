import { useState } from "react";
import {
  Shield,
  Bell,
  Clock,
  Lock,
  AlertTriangle,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { userSettings } from "@/data/dummyData";

export function SettingsPage() {
  const [settings, setSettings] = useState(userSettings);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex flex-col gap-1 mb-8 border-b border-border pb-6">
        <h1 className="page-header">Account Settings</h1>
        <p className="page-description mb-0">
          Configure privacy preferences and account security.
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy Settings */}
        <div className="section-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="defaultDuration" className="text-sm font-medium">
                Default Consent Duration
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                When granting access, this duration will be pre-selected
              </p>
              <Select
                value={settings.defaultConsentDuration}
                onValueChange={(value) => updateSetting("defaultConsentDuration", value)}
              >
                <SelectTrigger id="defaultDuration" className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 days">30 days</SelectItem>
                  <SelectItem value="90 days">90 days</SelectItem>
                  <SelectItem value="180 days">180 days</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-border">
              <div>
                <Label htmlFor="autoDeny" className="text-sm font-medium cursor-pointer">
                  Auto-Deny Unknown Services
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically reject requests from unverified services
                </p>
              </div>
              <Switch
                id="autoDeny"
                checked={settings.autoDenyUnknownServices}
                onCheckedChange={(checked) =>
                  updateSetting("autoDenyUnknownServices", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="section-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <Label htmlFor="notifyAccess" className="text-sm font-medium cursor-pointer">
                  Notify on Data Access
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when a service accesses your data
                </p>
              </div>
              <Switch
                id="notifyAccess"
                checked={settings.notifyOnAccess}
                onCheckedChange={(checked) => updateSetting("notifyOnAccess", checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <Label htmlFor="notifyDevice" className="text-sm font-medium cursor-pointer">
                  Notify on New Device Login
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Alert when your account is accessed from a new device
                </p>
              </div>
              <Switch
                id="notifyDevice"
                checked={settings.notifyOnNewDevice}
                onCheckedChange={(checked) => updateSetting("notifyOnNewDevice", checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <Label htmlFor="notifyExpiry" className="text-sm font-medium cursor-pointer">
                  Consent Expiry Reminders
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Remind before consents expire
                </p>
              </div>
              <Switch
                id="notifyExpiry"
                checked={settings.notifyBeforeExpiry}
                onCheckedChange={(checked) =>
                  updateSetting("notifyBeforeExpiry", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="section-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label htmlFor="twoFactor" className="text-sm font-medium cursor-pointer">
                Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Require OTP verification for every login
              </p>
            </div>
            <Switch
              id="twoFactor"
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => updateSetting("twoFactorEnabled", checked)}
            />
          </div>
        </div>

        {/* Account Actions */}
        <div className="section-card border-destructive/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
          </div>

          <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Deactivate Account</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Temporarily disable your digital identity. This will revoke all active
                  consents.
                </p>
              </div>
              <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" aria-label="Request account deactivation">
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Request Deactivation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deactivate Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to deactivate your digital identity? This action
                      will:
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="space-y-2 text-sm text-muted-foreground" aria-label="Deactivation consequences">
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true">•</span> Revoke all active consents immediately
                    </li>
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true">•</span> Block all data access requests
                    </li>
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true">•</span> Terminate all active sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true">•</span> Require re-verification to reactivate
                    </li>
                  </ul>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeactivateDialog(false)}
                      autoFocus
                    >
                      Confirm Deactivation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="min-w-[120px]">
            {saved ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
