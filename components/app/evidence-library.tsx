"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  CalendarClock,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Filter,
  FolderGit2,
  Globe,
  Hash,
  Search,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import type { Evidence, EvidenceType } from "@/lib/types";
import { api, queryKeys } from "@/lib/api";
import { formatDate, formatDateTime, formatAddress, cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { EvidenceStatusBadge } from "@/components/app/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/app/empty-state";

const typeMeta: Record<
  EvidenceType,
  { label: string; icon: typeof FileText; color: string }
> = {
  github_repo: { label: "GitHub Repository", icon: FolderGit2, color: "#9E9E9E" },
  github_pr: { label: "GitHub Pull Request", icon: FileCode, color: "#9E9E9E" },
  website: { label: "Website", icon: Globe, color: "#9E9E9E" },
  pdf: { label: "PDF Document", icon: FileText, color: "#F59E0B" },
  zip: { label: "ZIP Archive", icon: FileArchive, color: "#3B82F6" },
  image: { label: "Image", icon: FileImage, color: "#22C55E" },
  video: { label: "Video", icon: FileVideo, color: "#EF4444" },
  document: { label: "Document", icon: FileText, color: "#9E9E9E" },
};

const agreementLabels: Record<string, string> = {
  agr_alpha: "Stellar: Website Redesign",
  agr_beta: "Quanta: Mobile App v2",
  agr_gamma: "Orbit: Payment API",
  agr_delta: "Vertex: Design System",
  agr_epsilon: "Monarch: Brand Identity",
  agr_zeta: "Atlas: Internal Tools",
  agr_theta: "Helios: Landing Page",
  agr_iota: "Cascade: Mobile Wallet",
  agr_kappa: "Beacon: Smart Contract",
  agr_lambda: "Northstar: Dashboard",
  agr_mu: "Echo: Community Site",
  agr_nu: "Ironclad: Security Audit",
};

export function EvidenceLibrary() {
  const searchParams = useSearchParams();
  const preselectedAgreement = searchParams.get("agreement") ?? undefined;

  const { data: items, isLoading } = useQuery({
    queryKey: queryKeys.evidence,
    queryFn: api.evidence.list,
  });

  const [query, setQuery] = useState("");
  const [agreement, setAgreement] = useState<string | undefined>(preselectedAgreement);
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Evidence | null>(null);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return items.filter((e) => {
      if (agreement && e.agreementId !== agreement) return false;
      if (type !== "all" && e.type !== type) return false;
      if (status !== "all" && e.status !== status) return false;
      if (q && !`${e.title} ${e.filename ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, agreement, type, status]);

  const hasFilters = query || (agreement && agreement !== preselectedAgreement) || type !== "all" || status !== "all";

  const resetFilters = () => {
    setQuery("");
    setAgreement(undefined);
    setType("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence"
        description="Hashed, timestamped, and versioned proof for every agreement."
      >
        <SubmitEvidenceDialog
          preselectAgreement={preselectedAgreement}
          onSubmitted={(e) => toast.success("Evidence submitted", { description: e.title })}
        />
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search evidence…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={agreement ?? "all"} onValueChange={(v) => setAgreement(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All agreements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agreements</SelectItem>
              {Object.entries(agreementLabels).map(([id, label]) => (
                <SelectItem key={id} value={id}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(typeMeta) as EvidenceType[]).map((t) => (
                <SelectItem key={t} value={t}>{typeMeta[t].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="under_review">Under review</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={resetFilters}
          className="flex w-fit items-center gap-1 text-[12px] text-muted-2 transition-colors hover:text-foreground"
        >
          <X className="h-3 w-3" /> Clear filters
        </button>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No evidence found"
              description="Adjust your filters or submit new evidence from any agreement."
              actionLabel="Clear filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((item) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-surface"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2"
                      style={{ color: meta.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {item.title}
                        </p>
                        {item.version > 1 && (
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            v{item.version}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-muted-2">
                        {item.filename ?? item.url} · {agreementLabels[item.agreementId] ?? item.agreementId}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-2">
                        <span>{meta.label}</span>
                        <span>·</span>
                        <span>{item.size}</span>
                        <span>·</span>
                        <span>{formatDate(item.submittedAt)}</span>
                        <span>·</span>
                        <span>{item.submittedBy}</span>
                      </p>
                    </div>
                    <EvidenceStatusBadge status={item.status} />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <EvidenceDialog item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SubmitEvidenceDialog({
  preselectAgreement,
  onSubmitted,
}: {
  preselectAgreement?: string;
  onSubmitted: (e: { title: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [type, setType] = useState<EvidenceType>("pdf");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setFileName(null);
    setTitle("");
    setDescription("");
    setType("pdf");
    setUploading(false);
  };

  const submit = async () => {
    if (!fileName) {
      toast.error("No file selected", { description: "Attach a file or link to submit." });
      return;
    }
    if (!title.trim()) {
      toast.error("Add a title", { description: "Give this evidence a recognizable name." });
      return;
    }
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1300));
    setUploading(false);
    onSubmitted({ title: title.trim() });
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UploadCloud className="h-4 w-4" /> Submit evidence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Submit evidence</DialogTitle>
          <DialogDescription>
            Files are hashed and timestamped on chain. Choose the agreement and milestone this
            proof belongs to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Agreement</Label>
              <Select value={preselectAgreement ?? "agr_alpha"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(agreementLabels).map(([id, label]) => (
                    <SelectItem key={id} value={id}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Evidence type</Label>
              <Select value={type} onValueChange={(v) => setType(v as EvidenceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(typeMeta) as EvidenceType[]).map((t) => (
                    <SelectItem key={t} value={t}>{typeMeta[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-title">Title</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production deployment checklist"
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setFileName(f.name);
            }}
            onClick={() => document.getElementById("evidence-file")?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
              dragging ? "border-foreground bg-surface" : "border-border bg-surface-2/50 hover:border-foreground/40"
            )}
          >
            {fileName ? (
              <div className="flex items-center gap-2 text-[13px] text-foreground">
                <Check className="h-4 w-4 text-success" />
                <span className="max-w-[280px] truncate font-mono">{fileName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileName(null);
                  }}
                  className="text-muted-2 hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-muted-2" />
                <p className="mt-3 text-[13px] font-medium text-foreground">
                  Drag & drop a file, or click to browse
                </p>
                <p className="mt-1 text-[11px] text-muted-2">
                  PDF, ZIP, images, video, or paste a public URL below
                </p>
              </>
            )}
            <input
              id="evidence-file"
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFileName(f.name);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-desc">Description</Label>
            <Textarea
              id="ev-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this prove, and how should a reviewer verify it?"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-2">
            SHA-256 hash computed client-side before upload.
          </p>
          <Button onClick={submit} disabled={uploading}>
            {uploading ? "Hashing & uploading…" : "Submit evidence"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EvidenceDialog({
  item,
  onClose,
}: {
  item: Evidence | null;
  onClose: () => void;
}) {
  const meta = item ? typeMeta[item.type] : null;

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        {item && meta && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2"
                    style={{ color: meta.color }}
                  >
                    <meta.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-[15px]">{item.title}</DialogTitle>
                    <DialogDescription>
                      {item.filename ?? item.url}
                    </DialogDescription>
                  </div>
                </div>
                <EvidenceStatusBadge status={item.status} />
              </div>
            </DialogHeader>

            {item.description && (
              <p className="text-[13px] leading-relaxed text-muted">{item.description}</p>
            )}

            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="versions" className="flex-1">Version history</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4 space-y-2.5 text-[13px]">
                <Row icon={FolderGit2} label="Agreement" value={agreementLabels[item.agreementId] ?? item.agreementId} />
                <Row icon={Hash} label="SHA-256" mono value={`${item.hash.slice(0, 16)}…`} copyValue={item.hash} />
                <Row icon={CalendarClock} label="Submitted" value={formatDateTime(item.submittedAt)} />
                <Row icon={Activity} label="Submitted by" value={item.submittedBy} />
                {item.url && (
                  <Row icon={ExternalLink} label="Source" value={item.url} link={item.url} />
                )}
                {item.status === "verified" && item.verifiedAt && (
                  <Row icon={ShieldCheck} label="Verified" value={`${formatDateTime(item.verifiedAt)} · ${item.verifier}`} />
                )}
              </TabsContent>
              <TabsContent value="versions" className="mt-4 space-y-2">
                {Array.from({ length: item.version }).reverse().map((_, i) => {
                  const v = item.version - i;
                  const current = v === item.version;
                  return (
                    <div
                      key={v}
                      className={cn(
                        "flex items-center justify-between rounded-md border px-3 py-2.5 text-[12px]",
                        current ? "border-foreground/20 bg-surface" : "border-border bg-surface-2/50"
                      )}
                    >
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <FileText className="h-3.5 w-3.5 text-muted-2" /> v{v}
                        {current && <Badge className="px-1.5 py-0 text-[10px]">latest</Badge>}
                      </span>
                      <span className="text-muted-2">
                        {formatDate(item.submittedAt)} · {item.size}
                      </span>
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
              {item.url ? (
                <Button variant="secondary" size="sm" asChild>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Open source
                  </a>
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => toast.success("Download started")}>
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(item.hash);
                  toast.success("Hash copied", { description: formatAddress(item.hash) });
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy hash
              </Button>
              {item.status !== "verified" && (
                <Button
                  variant="success"
                  size="sm"
                  className="ml-auto"
                  onClick={() => toast.success("Evidence verified", { description: "Marked as verified by Pact Mediator." })}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Verify
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
  copyValue,
  link,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  mono?: boolean;
  copyValue?: string;
  link?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="flex items-center gap-2 text-muted">
        <Icon className="h-3.5 w-3.5 text-muted-2" /> {label}
      </span>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className="max-w-[60%] truncate text-foreground underline-offset-4 hover:underline">
          {value}
        </a>
      ) : (
        <span className={cn("max-w-[60%] truncate text-foreground", mono && "font-mono text-[12px]")}>
          {value}
        </span>
      )}
      {copyValue && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(copyValue);
            toast.success("Copied to clipboard");
          }}
          className="text-muted-2 transition-colors hover:text-foreground"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
