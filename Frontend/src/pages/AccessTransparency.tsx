import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Building2,
  FileText,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { accessLog } from "@/data/dummyData";

const statusIcons = {
  approved: CheckCircle2,
  denied: XCircle,
  expired: Clock,
};

const statusColors = {
  approved: "bg-success",
  denied: "bg-destructive",
  expired: "bg-muted-foreground",
};

export function AccessTransparency() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  const uniqueServices = [...new Set(accessLog.map((log) => log.service))];

  const filteredLogs = accessLog.filter((log) => {
    const matchesSearch =
      log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.attributes.some((attr) =>
        attr.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesService = serviceFilter === "all" || log.service === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-1 mb-8 border-b border-border pb-6">
        <h1 className="page-header">Access Transparency</h1>
        <p className="page-description mb-2">
          Complete audit log of all data access requests and their outcomes.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 w-fit px-3 py-1.5 rounded-full border border-border/50">
          <Shield className="h-3.5 w-3.5" />
          <span>Immutability: These logs are cryptographically secured and cannot be altered.</span>
        </div>
      </div>

      {/* Query Tools (Filters) */}
      <div className="mb-8 p-4 bg-card border border-border rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Audit Query Tools</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID, service, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-background font-mono text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="Service Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {uniqueServices.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audit Ledger List */}
      <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/40 border-b border-border px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Audit Ledger
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {filteredLogs.length} Records Found
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No audit records match your query.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const StatusIcon = statusIcons[log.status as keyof typeof statusIcons];

              return (
                <div key={log.id} className="p-4 sm:px-6 hover:bg-muted/10 transition-colors group">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                    {/* Time & ID Column */}
                    <div className="min-w-[140px] flex-shrink-0">
                      <p className="text-xs font-mono text-muted-foreground">{log.timestamp}</p>
                      <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">ID: {log.id.toUpperCase()}</p>
                    </div>

                    {/* Service & Action Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{log.service}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground uppercase">
                          {log.entityType}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">
                        <span className="text-muted-foreground">Purpose:</span> {log.purpose}
                      </p>

                      {/* Evidence Details */}
                      <div className="flex flex-wrap gap-1.5">
                        {log.attributes.map((attr) => (
                          <span key={attr} className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Outcome Column */}
                    <div className="flex-shrink-0 sm:text-right min-w-[100px] flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${log.status === 'approved'
                        ? 'bg-success/5 text-success border-success/20'
                        : log.status === 'denied'
                          ? 'bg-destructive/5 text-destructive border-destructive/20'
                          : 'bg-muted text-muted-foreground border-border'
                        }`}>
                        <StatusIcon className="h-3 w-3" />
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
