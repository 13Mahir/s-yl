// Master Identity
export const masterIdentity = {
  id: "DID-2024-IN-78432156",
  created: "2024-01-15",
  lastVerified: "2025-01-10",
};

// Identity Attributes
export const identityAttributes = {
  personal: [
    { id: "p1", name: "Full Name", value: "Rajesh Kumar Sharma", stored: true, shared: true, lastAccessed: "2025-01-15 14:30" },
    { id: "p2", name: "Date of Birth", value: "1985-03-22", stored: true, shared: false, lastAccessed: null },
    { id: "p3", name: "Aadhaar Number", value: "XXXX-XXXX-4532", stored: true, shared: true, lastAccessed: "2025-01-14 09:15" },
    { id: "p4", name: "PAN Number", value: "XXXXX1234X", stored: true, shared: false, lastAccessed: null },
    { id: "p5", name: "Address", value: "42, Green Park Colony, Jaipur", stored: true, shared: true, lastAccessed: "2025-01-12 16:45" },
    { id: "p6", name: "Phone Number", value: "+91 98XXX XXXXX", stored: true, shared: true, lastAccessed: "2025-01-15 14:30" },
  ],
  healthcare: [
    { id: "h1", name: "Blood Group", value: "O+", stored: true, shared: true, lastAccessed: "2025-01-10 11:20" },
    { id: "h2", name: "Allergies", value: "Penicillin", stored: true, shared: true, lastAccessed: "2025-01-10 11:20" },
    { id: "h3", name: "Vaccination Status", value: "COVID-19: Fully Vaccinated", stored: true, shared: false, lastAccessed: null },
    { id: "h4", name: "Medical History", value: "Diabetes Type 2", stored: true, shared: false, lastAccessed: null },
    { id: "h5", name: "Emergency Contact", value: "Priya Sharma (Wife)", stored: true, shared: true, lastAccessed: "2025-01-10 11:20" },
  ],
  agriculture: [
    { id: "a1", name: "Land Holding", value: "5.2 Hectares", stored: true, shared: true, lastAccessed: "2025-01-08 10:00" },
    { id: "a2", name: "Farmer ID", value: "RJ-AGR-2019-45678", stored: true, shared: true, lastAccessed: "2025-01-08 10:00" },
    { id: "a3", name: "Crop Type", value: "Wheat, Mustard", stored: true, shared: true, lastAccessed: "2025-01-08 10:00" },
    { id: "a4", name: "Bank Account (Subsidy)", value: "XXXX XXXX 7890", stored: true, shared: false, lastAccessed: null },
    { id: "a5", name: "Kisan Credit Card", value: "Active - ₹3,00,000 Limit", stored: true, shared: false, lastAccessed: null },
  ],
  cityServices: [
    { id: "c1", name: "Property Tax ID", value: "JPR-PROP-2020-12345", stored: true, shared: false, lastAccessed: null },
    { id: "c2", name: "Water Connection", value: "Active - Domestic", stored: true, shared: true, lastAccessed: "2025-01-05 09:30" },
    { id: "c3", name: "Electricity Consumer No.", value: "JVVNL-123456789", stored: true, shared: false, lastAccessed: null },
    { id: "c4", name: "Driving License", value: "RJ14-2015-XXXXXXX", stored: true, shared: false, lastAccessed: null },
    { id: "c5", name: "Voter ID", value: "Registered - Ward 23", stored: true, shared: false, lastAccessed: null },
  ],
};

// Active Consents
export const activeConsents = [
  {
    id: "c1",
    serviceName: "State Health Department",
    entityType: "Government" as const,
    verified: true,
    purpose: "COVID-19 Vaccination Drive",
    attributes: ["Full Name", "Date of Birth", "Blood Group", "Allergies"],
    grantedOn: "2025-01-10",
    expiresOn: "2025-04-10",
    status: "active",
  },
  {
    id: "c2",
    serviceName: "PM-KISAN Portal",
    entityType: "Government" as const,
    verified: true,
    purpose: "Farm Subsidy Disbursement",
    attributes: ["Full Name", "Farmer ID", "Land Holding", "Crop Type", "Bank Account (Subsidy)"],
    grantedOn: "2025-01-08",
    expiresOn: "2025-07-08",
    status: "active",
  },
  {
    id: "c3",
    serviceName: "Jaipur Municipal Corporation",
    entityType: "Public Service" as const,
    verified: true,
    purpose: "Water Bill Online Payment",
    attributes: ["Full Name", "Address", "Water Connection"],
    grantedOn: "2025-01-05",
    expiresOn: "2025-02-05",
    status: "active",
  },
];

// Pending Consent Request
export const pendingConsentRequest = {
  id: "pending1",
  serviceName: "Rajasthan Transport Authority",
  verified: true,
  purpose: "Driving License Renewal Application",
  requestedAttributes: [
    { id: "ra1", name: "Full Name", required: true },
    { id: "ra2", name: "Date of Birth", required: true },
    { id: "ra3", name: "Address", required: true },
    { id: "ra4", name: "Driving License", required: true },
    { id: "ra5", name: "Aadhaar Number", required: false },
    { id: "ra6", name: "Phone Number", required: false },
  ],
  requestedOn: "2025-01-17 09:00",
  durationOptions: ["30 days", "90 days", "180 days", "1 year"],
};

// Access Log
export const accessLog = [
  {
    id: "log1",
    service: "State Health Department",
    entityType: "Government" as const,
    attributes: ["Full Name", "Blood Group", "Allergies", "Emergency Contact"],
    timestamp: "2025-01-15 14:30",
    purpose: "Emergency Medical Access",
    status: "approved",
  },
  {
    id: "log2",
    service: "PM-KISAN Portal",
    entityType: "Government" as const,
    attributes: ["Full Name", "Farmer ID", "Land Holding", "Crop Type"],
    timestamp: "2025-01-14 09:15",
    purpose: "Subsidy Eligibility Verification",
    status: "approved",
  },
  {
    id: "log3",
    service: "Unknown Third Party",
    entityType: "Institution" as const,
    attributes: ["Full Name", "Aadhaar Number", "Bank Account"],
    timestamp: "2025-01-13 22:45",
    purpose: "Unverified Request",
    status: "denied",
  },
  {
    id: "log4",
    service: "Rajasthan Transport Authority",
    entityType: "Government" as const,
    attributes: ["Full Name", "Driving License"],
    timestamp: "2025-01-12 16:45",
    purpose: "License Verification",
    status: "expired",
  },
  {
    id: "log5",
    service: "Jaipur Municipal Corporation",
    entityType: "Public Service" as const,
    attributes: ["Full Name", "Address", "Water Connection"],
    timestamp: "2025-01-10 11:20",
    purpose: "Utility Service Access",
    status: "approved",
  },
  {
    id: "log6",
    service: "State Health Department",
    entityType: "Government" as const,
    attributes: ["Full Name", "Date of Birth", "Blood Group"],
    timestamp: "2025-01-08 10:00",
    purpose: "Vaccination Record Update",
    status: "approved",
  },
];

// Active Sessions
export const activeSessions = [
  {
    id: "s1",
    device: "Chrome on Windows 11",
    location: "Jaipur, Rajasthan",
    ip: "103.XX.XX.45",
    lastActive: "2025-01-17 10:30",
    current: true,
  },
  {
    id: "s2",
    device: "Safari on iPhone 14",
    location: "Jaipur, Rajasthan",
    ip: "103.XX.XX.78",
    lastActive: "2025-01-16 18:45",
    current: false,
  },
  {
    id: "s3",
    device: "Firefox on Ubuntu",
    location: "Delhi, NCR",
    ip: "49.XX.XX.12",
    lastActive: "2025-01-15 09:00",
    current: false,
  },
];

// Security Alerts
export const securityAlerts = [
  {
    id: "alert1",
    type: "warning",
    title: "Unusual Login Location",
    message: "Login attempt detected from Delhi, NCR. If this wasn't you, please review your sessions.",
    timestamp: "2025-01-15 09:00",
    acknowledged: false,
  },
  {
    id: "alert2",
    type: "error",
    title: "Access Request Denied",
    message: "Blocked unauthorized access attempt from unverified service requesting sensitive data.",
    timestamp: "2025-01-13 22:45",
    acknowledged: true,
  },
  {
    id: "alert3",
    type: "info",
    title: "Consent Expiring Soon",
    message: "Your consent for Jaipur Municipal Corporation will expire in 19 days.",
    timestamp: "2025-01-17 08:00",
    acknowledged: false,
  },
];

// Settings
export const userSettings = {
  defaultConsentDuration: "90 days",
  autoDenyUnknownServices: true,
  notifyOnAccess: true,
  notifyOnNewDevice: true,
  notifyBeforeExpiry: true,
  twoFactorEnabled: true,
};

// Service Portal Data
export const servicePortals = {
  healthcare: {
    name: "State Health Department Portal",
    authorized: ["Full Name", "Date of Birth", "Blood Group", "Allergies", "Emergency Contact"],
    unauthorized: ["Medical History", "Vaccination Status", "Phone Number", "Address"],
    lastAccess: "2025-01-15 14:30",
  },
  agriculture: {
    name: "PM-KISAN Subsidy Portal",
    authorized: ["Full Name", "Farmer ID", "Land Holding", "Crop Type"],
    unauthorized: ["Bank Account (Subsidy)", "Kisan Credit Card", "Phone Number"],
    lastAccess: "2025-01-14 09:15",
  },
  cityServices: {
    name: "Jaipur Municipal Corporation Portal",
    authorized: ["Full Name", "Address", "Water Connection"],
    unauthorized: ["Property Tax ID", "Electricity Consumer No.", "Driving License", "Voter ID"],
    lastAccess: "2025-01-10 11:20",
  },
};
