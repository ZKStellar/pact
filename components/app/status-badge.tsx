import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type {
  AgreementStatus,
  EvidenceStatus,
  MediationStatus,
  MilestoneStatus,
  TransactionStatus,
} from "@/lib/types";

const agreementConfig: Record<AgreementStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "muted" | "default" }> = {
  draft: { label: "Draft", variant: "muted" },
  funding: { label: "Funding", variant: "info" },
  active: { label: "Active", variant: "success" },
  disputed: { label: "Disputed", variant: "danger" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "muted" },
  expired: { label: "Expired", variant: "warning" },
};

const milestoneConfig: Record<MilestoneStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "muted" | "default" }> = {
  pending: { label: "Pending", variant: "muted" },
  active: { label: "In progress", variant: "info" },
  submitted: { label: "Submitted", variant: "info" },
  reviewing: { label: "In review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  disputed: { label: "Disputed", variant: "danger" },
  rejected: { label: "Rejected", variant: "danger" },
};

const mediationConfig: Record<MediationStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "muted" | "default" }> = {
  open: { label: "Open", variant: "danger" },
  in_review: { label: "In review", variant: "warning" },
  decided: { label: "Decided", variant: "success" },
  escalated: { label: "Escalated", variant: "default" },
};

const evidenceConfig: Record<EvidenceStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "muted" | "default" }> = {
  pending: { label: "Pending", variant: "muted" },
  under_review: { label: "Under review", variant: "warning" },
  verified: { label: "Verified", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

const transactionConfig: Record<TransactionStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "muted" | "default" }> = {
  completed: { label: "Completed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
};

type Variant = "success" | "warning" | "danger" | "info" | "muted" | "default";

function StatusBadge({
  status,
  variant,
  label,
  className,
  dot = true,
}: {
  status?: string;
  variant: Variant;
  label: string;
  className?: string;
  dot?: boolean;
}) {
  const dotColors: Record<Variant, string> = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    muted: "bg-muted-2",
    default: "bg-muted",
  };
  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {label}
      <span className="sr-only">{status}</span>
    </Badge>
  );
}

export function AgreementStatusBadge({
  status,
  className,
}: {
  status: AgreementStatus;
  className?: string;
}) {
  const c = agreementConfig[status];
  return <StatusBadge status={status} variant={c.variant} label={c.label} className={className} />;
}

export function MilestoneStatusBadge({
  status,
  className,
}: {
  status: MilestoneStatus;
  className?: string;
}) {
  const c = milestoneConfig[status];
  return <StatusBadge status={status} variant={c.variant} label={c.label} className={className} />;
}

export function MediationStatusBadge({
  status,
  className,
}: {
  status: MediationStatus;
  className?: string;
}) {
  const c = mediationConfig[status];
  return <StatusBadge status={status} variant={c.variant} label={c.label} className={className} />;
}

export function EvidenceStatusBadge({
  status,
  className,
}: {
  status: EvidenceStatus;
  className?: string;
}) {
  const c = evidenceConfig[status];
  return <StatusBadge status={status} variant={c.variant} label={c.label} className={className} />;
}

export function TransactionStatusBadge({
  status,
  className,
}: {
  status: TransactionStatus;
  className?: string;
}) {
  const c = transactionConfig[status];
  return <StatusBadge status={status} variant={c.variant} label={c.label} className={className} />;
}
