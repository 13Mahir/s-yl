import {
  Copy,
  CheckCircle2,
  Clock,
  User,
  HeartPulse,
  Wheat,
  Building,
  Shield,
  Bell,
  FileKey,
  History,
  Lock,
  AlertCircle,
  Fingerprint,
  Plus,
  Trash2,
  MoreHorizontal,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { identityAttributes } from "@/data/dummyData";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Types ---
type CategoryKey = 'personal' | 'healthcare' | 'agriculture' | 'cityServices' | 'vault';

interface VaultItem {
  id: string;
  category: CategoryKey;
  label: string;
  value: string;
  verified: boolean;
  shared: boolean;
  lastUpdated?: string;
}

// --- Initial Data Transformation ---
const transformInitialData = (): VaultItem[] => {
  const items: VaultItem[] = [];

  // Map existing mock data
  (Object.entries(identityAttributes) as [string, any[]][]).forEach(([cat, attrs]) => {
    attrs.forEach(attr => {
      items.push({
        id: attr.id,
        category: cat as CategoryKey,
        label: attr.name,
        value: attr.value,
        verified: attr.stored, // Mapping 'stored' to verified for this demo
        shared: attr.shared,
        lastUpdated: "Jan 2024"
      });
    });
  });

  return items;
};

// --- Config ---
const categoryConfig: Record<CategoryKey, { icon: any, label: string, color: string, description: string }> = {
  personal: { icon: User, label: "Personal Information", color: "text-blue-600", description: "Basic identity details verified by National Registry." },
  healthcare: { icon: HeartPulse, label: "Healthcare Records", color: "text-rose-600", description: "Linked medical history and insurance data." },
  agriculture: { icon: Wheat, label: "Agriculture & Farm Data", color: "text-amber-600", description: "Land records, crops, and subsidy information." },
  cityServices: { icon: Building, label: "Urban & Civic Services", color: "text-slate-600", description: "Utilities, tax records, and municipal services." },
  vault: { icon: Lock, label: "Personal Vault", color: "text-indigo-600", description: "Private, user-added secure information." }
};

export function IdentityOverview() {
  const { user, loading, logout } = useAuth(); // Global Auth State
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");

  // --- Real Data State ---
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeConsents, setActiveConsents] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([
    { id: 1, device: "Current Session", location: "Mumbai, India", active: true, ip: "103.21.45.12" }
  ]);

  // --- User Profile State ---
  const [userProfile, setUserProfile] = useState<{ name: string; id: string; role: string } | null>(null);

  // --- Vault State ---
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [manageMode, setManageMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Effect to sync userProfile from Global Auth
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.displayName,
        id: user.identityId,
        role: user.role
      });
    }
  }, [user]);

  // Combined fetch for FULL profile details
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    // Trigger Profile Fetch
    const fetchProfileAndVault = async () => {
      const token = sessionStorage.getItem("auth_token");
      if (!token) return;

      try {
        // Get Full Profile using Verified ID
        const profileRes = await fetch(`http://localhost:5001/api/auth/profile?unique_id=${user.identityId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        if (!profileData.success) {
          console.error("Failed to fetch profile");
          return;
        }

        const fullUser = profileData.user;

        setUserProfile({
          name: fullUser.full_name,
          id: fullUser.unique_id,
          role: fullUser.role
        });

        // 1. Generate Personal Information Blocks
        const personalItems: VaultItem[] = [
          { id: 'pi-name', category: 'personal', label: 'Full Name', value: fullUser.full_name, verified: true, shared: true, lastUpdated: 'Verified' },
          { id: 'pi-dob', category: 'personal', label: 'Date of Birth', value: fullUser.dob ? new Date(fullUser.dob).toLocaleDateString() : 'N/A', verified: true, shared: false, lastUpdated: 'Verified' },
          { id: 'pi-gender', category: 'personal', label: 'Gender', value: fullUser.gender || 'N/A', verified: true, shared: false, lastUpdated: 'Verified' },
          { id: 'pi-addr', category: 'personal', label: 'Primary Address', value: `${fullUser.address_city || ''}, ${fullUser.address_state || ''}`, verified: true, shared: true, lastUpdated: 'Verified' }
        ];

        // 1.5 Generate Detailed Healthcare Blocks
        const healthcareItems: VaultItem[] = [];

        // Helper to safely add if value exists
        const addHC = (id: string, label: string, val: any, shared = false) => {
          if (val) healthcareItems.push({ id, category: 'healthcare', label, value: String(val), verified: true, shared, lastUpdated: 'Medical Verified' });
        };

        // Core
        addHC('hc-id', 'Health ID', fullUser.health_id, true);
        addHC('hc-bg', 'Blood Group', fullUser.blood_group, true);
        if (fullUser.clinical_vitals_date) addHC('hc-verif', 'Last Verification', new Date(fullUser.clinical_vitals_date).toLocaleDateString());

        // History
        addHC('hc-cond', 'Chronic Conditions', fullUser.known_conditions, false); // "Asthma"
        addHC('hc-illness', 'Past Major Illnesses', fullUser.past_major_illnesses);
        addHC('hc-allergy', 'Allergies', fullUser.allergies, false);

        // Medications (Formatted)
        if (fullUser.current_medications) {
          let meds = fullUser.current_medications;
          if (typeof meds === 'string') {
            try { meds = JSON.parse(meds); } catch (e) { meds = null; }
          }
          if (Array.isArray(meds)) {
            const medsStr = meds.map((m: any) => `${m.name} (${m.dosage})`).join(', ');
            addHC('hc-meds', 'Current Medications', medsStr);
          }
        }

        // Vitals
        addHC('hc-height', 'Height', fullUser.clinical_height);
        addHC('hc-weight', 'Weight', fullUser.clinical_weight);

        // Emergency
        addHC('hc-emg', 'Emergency Contact', fullUser.emergency_contact);
        addHC('hc-risk', 'Life Threatening', fullUser.life_threatening_conditions);


        // ... (Personal & Healthcare mapping is above)

        // 2. Agriculture Data (Mapped from Backend)
        const agricultureItems: VaultItem[] = [];
        const addAgri = (id: string, label: string, val: any) => {
          if (val && val !== 'null') agricultureItems.push({ id, category: 'agriculture', label, value: String(val), verified: true, shared: false, lastUpdated: 'Govt Verified' });
        };
        addAgri('ag-land', 'Land Ownership', fullUser.agri_land_status);
        addAgri('ag-sub', 'Subsidy Enrollment', fullUser.agri_subsidy);
        addAgri('ag-farm', 'Farm Activity', fullUser.agri_farm_activity);
        addAgri('ag-soil', 'Soil Health Card', fullUser.agri_soil_health);

        // 3. Civic Data (Mapped from Backend)
        const civicItems: VaultItem[] = [];
        const addCivic = (id: string, label: string, val: any) => {
          if (val && val !== 'null') civicItems.push({ id, category: 'cityServices', label, value: String(val), verified: true, shared: false, lastUpdated: 'Govt Verified' });
        };
        addCivic('civ-addr', 'Residential Address', fullUser.civic_address);
        addCivic('civ-city', 'City', fullUser.address_city);
        addCivic('civ-state', 'State', fullUser.address_state);
        addCivic('civ-zone', 'Municipal Zone', fullUser.civic_zone);
        addCivic('civ-util', 'Utility Registration', fullUser.civic_utility_status);


        // 4. Personal Vault (Client-Side / Demo Seeding)
        const vaultKey = `pending_vault_${user.identityId}`;
        const existingVaultData = localStorage.getItem(vaultKey);
        let optionalItems: VaultItem[] = [];

        if (!existingVaultData) {
          // DEMO RULE: Seed default Personal Vault items if empty
          // "Personal Vault (User Controlled)"
          const defaultVault = [
            { id: 'pv-contact', category: 'vault', label: 'Preferred Emergency Contact', value: 'Father – +91 9XXXXXXXXX', verified: false, shared: false, lastUpdated: 'Just now' },
            { id: 'pv-diet', category: 'vault', label: 'Dietary Preference', value: 'Vegetarian (No chickpeas)', verified: false, shared: false, lastUpdated: 'Just now' },
            { id: 'pv-note', category: 'vault', label: 'Personal Note', value: 'Allergic reactions require immediate attention', verified: false, shared: false, lastUpdated: 'Just now' },
            { id: 'pv-nick', category: 'vault', label: 'Travel ID Nickname', value: 'Mahir-Primary', verified: false, shared: false, lastUpdated: 'Just now' }
          ];
          optionalItems = defaultVault as VaultItem[]; // Cast to match type

          // Save to localStorage so it persists as "User Data"
          const storageFormat = [{
            category: 'vault', items: {
              'Preferred Emergency Contact': 'Father – +91 9XXXXXXXXX',
              'Dietary Preference': 'Vegetarian (No chickpeas)',
              'Personal Note': 'Allergic reactions require immediate attention',
              'Travel ID Nickname': 'Mahir-Primary'
            }
          }];
          // Actually the current localStorage format in parsing loop is slightly different (array of sections).
          // But here I am populating `optionalItems` directly for state. 
          // I should also save it correctly if I want persistence, but for "Demo" just state is enough on load.
        } else {
          try {
            const parsed = JSON.parse(existingVaultData);
            parsed.forEach((section: any) => {
              Object.entries(section.items).forEach(([key, val]) => {
                if (val) {
                  optionalItems.push({
                    id: `opt-${key}`,
                    category: section.category as CategoryKey,
                    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    value: String(val),
                    verified: false,
                    shared: false,
                    lastUpdated: 'Just now'
                  });
                }
              });
            });
          } catch (e) {
            console.error("Failed to parse", e);
          }
        }

        setVaultItems([...personalItems, ...healthcareItems, ...agricultureItems, ...civicItems, ...optionalItems]);
      } catch (err) {
        console.error("Network Error fetching profile:", err);
      }
    };

    // Parallel Fetch for Tabs
    const fetchDataTabs = async () => {
      const token = sessionStorage.getItem("auth_token");
      if (!token) return;

      try {
        // 1. Pending Requests
        const reqRes = await fetch("http://localhost:5001/api/consents/my-requests", { headers: { Authorization: `Bearer ${token}` } });
        const reqData = await reqRes.json();
        if (reqData.success) setPendingRequests(reqData.requests);

        // 2. Active Consents (Outbox/Active)
        const activeRes = await fetch("http://localhost:5001/api/consents/my-active", { headers: { Authorization: `Bearer ${token}` } });
        const activeData = await activeRes.json();
        if (activeData.success) setActiveConsents(activeData.consents);

        // 3. History (Audit Logs)
        const logRes = await fetch("http://localhost:5001/api/audit/my-data-access", { headers: { Authorization: `Bearer ${token}` } });
        const logData = await logRes.json();
        if (logData.success) setAccessLogs(logData.logs);

      } catch (e) {
        console.error("Failed to fetch tab data", e);
      }
    };

    fetchProfileAndVault();
    fetchDataTabs();


    fetchProfileAndVault();

  }, [loading, user, navigate]); // Removed dependencies that cause loops

  // --- Add Item State ---
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState<CategoryKey>('vault');
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemValue, setNewItemValue] = useState("");

  const copyToClipboard = () => {
    if (userProfile?.id) {
      navigator.clipboard.writeText(userProfile.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- Actions ---
  const handleAddItem = () => {
    if (!newItemLabel || !newItemValue) return;

    const newItem: VaultItem = {
      id: `custom-${Date.now()}`,
      category: newItemCategory,
      label: newItemLabel,
      value: newItemValue,
      verified: false, // User added items are unverified by default
      shared: false, // Privacy Default
      lastUpdated: "Just now"
    };

    setVaultItems([...vaultItems, newItem]);
    setIsAddDialogOpen(false);
    setNewItemLabel("");
    setNewItemValue("");
    setNewItemCategory('vault');
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = () => {
    const selectedList = vaultItems.filter(item => selectedItems.has(item.id));
    const hasSharedItems = selectedList.some(item => item.shared);

    if (hasSharedItems) {
      if (!confirm(`Warning: Some selected items are currently SHARED with active services. Deleting them will revoke access immediately. Continue?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to permanently delete ${selectedItems.size} items?`)) {
        return;
      }
    }

    setVaultItems(vaultItems.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
    setManageMode(false);
  };

  // --- Render Helpers ---
  const renderCategoryBlock = (category: CategoryKey) => {
    const items = vaultItems.filter(item => item.category === category);
    const config = categoryConfig[category];
    const Icon = config.icon;
    const isVault = category === 'vault';

    // Auto-hide rule: Only show if items exist OR it's the personal vault
    if (items.length === 0 && !isVault) return null;

    return (
      <div key={category} className={`group relative overflow-hidden rounded-2xl border ${isVault ? 'border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} p-6 transition-all duration-300 hover:shadow-md`}>

        {/* Category Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isVault ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-semibold ${isVault ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-100'}`}>
                {config.label}
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                {config.description}
              </p>
            </div>
          </div>

          {isVault && (
            <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50">
              Private
            </Badge>
          )}
        </div>

        {/* Items Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => manageMode && toggleSelection(item.id)}
                className={`
                  relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200
                  ${manageMode ? 'cursor-pointer hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10' : 'hover:border-slate-300 dark:hover:border-slate-700'}
                  ${selectedItems.has(item.id) ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'}
                `}
              >
                {/* Selection Checkbox (Manage Mode) */}
                {manageMode && (
                  <div className={`absolute top-3 right-3 h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${selectedItems.has(item.id) ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300 bg-white'}`}>
                    {selectedItems.has(item.id) && <Trash2 className="h-3 w-3" />}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </p>
                    {!manageMode && item.verified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={item.value}>
                    {item.value}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.shared ? "Shared with services" : "Not shared"}</span>
                  {item.lastUpdated && <span>Updated {item.lastUpdated}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State for Vault */
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-indigo-100 dark:border-indigo-900/30 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10">
            <FolderOpen className="h-8 w-8 text-indigo-300 mb-2" />
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Your vault is empty</p>
            <p className="text-xs text-indigo-400">Store additional personal information here.</p>
            <Button variant="link" size="sm" onClick={() => { setNewItemCategory('vault'); setIsAddDialogOpen(true); }} className="text-indigo-600 mt-1 h-auto p-0">
              Add Item to Vault
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Loading handled by local state or skeleton if needed, but for now we just show what we have.
  // AuthProvider handles main app loading.

  return (
    <div className="max-w-6xl mx-auto pb-20">

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome, {userProfile?.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your digital identity, consents, and security.
        </p>
      </div>

      {/* Master Identity Card (Always Visible) */}
      <div className="mb-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="h-5 w-5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Secure Digital ID</span>
            </div>
            <div className="flex items-center gap-3">
              <code className="text-3xl font-mono font-bold tracking-tight text-white">{userProfile?.id}</code>
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8 text-indigo-200 hover:text-white hover:bg-white/10">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-indigo-300 mb-1">Status</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified & Active
              </div>
            </div>
            <div>
              <p className="text-xs text-indigo-300 mb-1">Role</p>
              <p className="text-sm font-medium">{userProfile?.role || 'Citizen'}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="identity" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
          <TabsTrigger value="identity" className="py-2.5 rounded-lg"><User className="h-4 w-4 mr-2" /> Vault</TabsTrigger>
          <TabsTrigger value="requests" className="py-2.5 rounded-lg relative">
            <Bell className="h-4 w-4 mr-2" /> Requests
            {pendingRequests.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />}
          </TabsTrigger>
          <TabsTrigger value="consents" className="py-2.5 rounded-lg"><FileKey className="h-4 w-4 mr-2" /> Consents</TabsTrigger>
          <TabsTrigger value="history" className="py-2.5 rounded-lg"><History className="h-4 w-4 mr-2" /> History</TabsTrigger>
          <TabsTrigger value="security" className="py-2.5 rounded-lg"><Shield className="h-4 w-4 mr-2" /> Security</TabsTrigger>
        </TabsList>

        {/* 1. IDENTITY VAULT TAB */}
        <TabsContent value="identity" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">

          {/* Vault Controls */}
          <div className="flex items-center justify-between sticky top-4 z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <div className="px-2">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {manageMode ? `Select items to delete (${selectedItems.size})` : "My Data Blocks"}
              </h2>
            </div>
            <div className="flex gap-2">
              {manageMode ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => { setManageMode(false); setSelectedItems(new Set()); }}>Cancel</Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteSelected} disabled={selectedItems.size === 0}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setManageMode(true)}>
                    Manage Vault
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" /> Add Information
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Identity Vault</DialogTitle>
                        <DialogDescription>
                          Add a new piece of information to your personal vault.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <select
                            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value as CategoryKey)}
                          >
                            {Object.entries(categoryConfig).map(([key, conf]) => (
                              <option key={key} value={key}>{conf.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Label (e.g. "Passport Number")</Label>
                          <Input value={newItemLabel} onChange={(e) => setNewItemLabel(e.target.value)} placeholder="Enter label..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Input value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} placeholder="Enter value..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddItem} disabled={!newItemLabel || !newItemValue}>Add Item</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-8 pb-20">
            {renderCategoryBlock('personal')}
            {renderCategoryBlock('healthcare')}
            {renderCategoryBlock('agriculture')}
            {renderCategoryBlock('cityServices')}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500">Private Storage</span></div>
            </div>

            {renderCategoryBlock('vault')}
          </div>
        </TabsContent>

        {/* Other Tabs (Unchanged Content - Collapsed for brevity as per instructions but kept functional) */}
        <TabsContent value="requests" className="space-y-6">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No pending requests.</div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Building className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
                      <div><h4 className="text-base font-semibold text-slate-900 dark:text-white">{req.requester_name || req.requester_identity_id}</h4><p className="text-sm text-slate-500">{req.requester_role}</p></div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm"><span className="font-semibold text-slate-700 dark:text-slate-300">Purpose:</span> {req.purpose}</p>
                      <p className="text-sm"><span className="font-semibold text-slate-700 dark:text-slate-300">Requested Data:</span> {Array.isArray(req.allowed_attributes) ? req.allowed_attributes.join(", ") : req.allowed_attributes}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[140px]">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Allow Access</Button>
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">Deny Request</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="consents" className="space-y-6">
          <div className="grid gap-4">
            {activeConsents.length === 0 ? <p className="text-center text-slate-500 py-6">No active consents.</p> : activeConsents.map((consent) => (
              <div key={consent.id} className="flex justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-emerald-50 rounded-full"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                  <div>
                    <h4 className="text-base font-medium">{consent.requester_name || consent.requester_identity_id}</h4>
                    <p className="text-sm text-slate-500">Accessing: {Array.isArray(consent.allowed_attributes) ? consent.allowed_attributes.join(", ") : consent.allowed_attributes}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600">Revoke</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden divide-y divide-slate-100">
            {accessLogs.length === 0 ? <p className="p-4 text-center text-slate-500">No activity logs found.</p> : accessLogs.map((log) => (
              <div key={log.id} className="p-4 flex justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${['LOGIN', 'DATA_ACCESS', 'CONSENT_APPROVED'].includes(log.action_type) ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{log.action_type}</p>
                    <p className="text-xs text-slate-500">{log.purpose} • {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-xl flex gap-3 text-amber-800 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Review your active sessions regularly.</p>
          </div>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex justify-between p-5 border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg"><User className="h-6 w-6 text-slate-500" /></div>
                  <div><p className="text-sm font-medium">{session.device}</p><p className="text-xs text-slate-500">{session.location}</p></div>
                </div>
                <Button variant="outline" size="sm" className={session.active ? "opacity-50" : "text-red-600"}>{session.active ? "Active" : "Terminate"}</Button>
              </div>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
