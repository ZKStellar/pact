"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Copy,
  CheckCircle2,
  CircleDollarSign,
  Scale,
  FileStack,
  FilePenLine,
  MessageSquare,
  ExternalLink,
  Clock,
  ShieldCheck,
  Flag,
  Check,
  X,
  Pencil,
} from "lucide-react";
import type {
  Agreement,
  Mediation,
  AgreementAmendment,
  AmendmentChange,
} from "@/lib/types";
import {
  formatUsd,
  formatDate,
  formatDateTime,
  formatAddress,
  cn,
  initials,
  relativeTime,
  truncate,
} from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { AgreementStatusBadge, MilestoneStatusBadge, MediationStatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AgreementDetails({
  agreement: initialAgreement,
  mediation,
}: {
  agreement: Agreement;
  mediation?: Mediation;
}) {
  const router = useRouter();
  const [agreement, setAgreement] = useState(initialAgreement);
  const [amendments, setAmendments] = useState<AgreementAmendment[]>(
    initialAgreement.amendments ?? []
  );
  const [amending, setAmending] = useState(false);
  const fundedPct = Math.round((agreement.fundedAmount / agreement.totalAmount) * 100);

  const currentUser = agreement.parties.find((p) => p.role === agreement.role);
  const otherParty = agreement.parties.find(
    (p) => p.role !== agreement.role && p.role !== "escrow"
  );

  const copy = (value: string, label = "Copied") => {
    navigator.clipboard.writeText(value);
    toast.success(label);
  };

  const proposeAmendment = (draft: {
    headline: string;
    summary: string;
    title: string;
    description: string;
    milestoneDueDates: Record<string, string>;
  }) => {
    const changes: AmendmentChange[] = [];
    if (draft.title !== agreement.title) {
      changes.push({
        field: "Agreement title",
        from: agreement.title,
        to: draft.title,
      });
    }
    if (draft.description !== agreement.description) {
      changes.push({
        field: "Description",
        from: truncate(agreement.description, 90),
        to: truncate(draft.description, 90),
      });
    }
    agreement.milestones.forEach((m) => {
      const next = draft.milestoneDueDates[m.id];
      if (next && next !== m.dueDate) {
        changes.push({
          field: `Milestone "${m.title}" due date`,
          from: formatDate(m.dueDate),
          to: formatDate(next),
        });
      }
    });
    if (changes.length === 0) {
      toast.error("Nothing to amend", {
        description: "Change a term first, then propose the amendment.",
      });
      return false;
    }
    const amendment: AgreementAmendment = {
      id: `amd_${Date.now()}`,
      title: draft.headline,
      summary: draft.summary,
      proposedBy: currentUser?.name ?? "You",
      proposedAt: new Date().toISOString(),
      status: "pending",
      changes,
      proposedTitle: draft.title !== agreement.title ? draft.title : undefined,
      proposedDescription:
        draft.description !== agreement.description ? draft.description : undefined,
      milestoneDueDates: draft.milestoneDueDates,
    };
    setAmendments((prev) => [...prev, amendment]);
    toast.success("Amendment proposed", {
      description: `${otherParty?.name ?? "The other party"} has been asked to approve it.`,
    });
    return true;
  };

  const decideAmendment = (id: string, approve: boolean) => {
    const target = amendments.find((a) => a.id === id);
    if (!target) return;
    setAmendments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: approve ? "approved" : "rejected",
              decidedBy: otherParty?.name ?? "The other party",
              decidedAt: new Date().toISOString(),
            }
          : a
      )
    );
    if (approve) {
      setAgreement((prev) => {
        const next = { ...prev };
        if (target.proposedTitle) next.title = target.proposedTitle;
        if (target.proposedDescription) next.description = target.proposedDescription;
        if (target.milestoneDueDates) {
          next.milestones = prev.milestones.map((m) =>
            target.milestoneDueDates?.[m.id]
              ? { ...m, dueDate: target.milestoneDueDates[m.id] }
              : m
          );
        }
        return next;
      });
      toast.success("Amendment approved", {
        description: "The updated terms are now in effect for both parties.",
      });
    } else {
      toast.warning("Amendment rejected", {
        description: "The agreement terms remain unchanged.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={agreement.title}
        description={`${agreement.code} · ${agreement.currency} on ${agreement.chain === "stellar-mainnet" ? "Stellar mainnet" : "Stellar testnet"}`}
      >
        <AgreementStatusBadge status={agreement.status} />
        <Button variant="secondary" onClick={() => setAmending(true)}>
          <Pencil /> Edit terms
        </Button>
        <Button variant="secondary" onClick={() => router.push("/wallet")}>
          <CircleDollarSign /> Fund
        </Button>
        {agreement.status === "disputed" ? (
          <Button asChild>
            <Link href={`/mediations/${mediation?.id ?? ""}`}>
              <Scale /> View mediation
            </Link>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Scale /> More actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.success("Reminder sent", { description: "The other party was notified to review outstanding milestones." })}>
                <Clock /> Send reminder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toast("Dispute flow preview", {
                    description: "Disputes open a mediation reviewed by the Pact Mediator.",
                  })
                }
              >
                <Flag /> Open dispute
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => copy(agreement.escrowAddress, "Escrow address copied")}>
                <Copy /> Copy escrow address
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Export queued", { description: "A full agreement export will be emailed to you." })}>
                <ExternalLink /> Export agreement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          {amendments.filter((a) => a.status === "pending").length > 0 && (
            <PendingAmendmentCard
              amendments={amendments}
              otherParty={otherParty?.name ?? "The other party"}
              onDecide={decideAmendment}
            />
          )}

          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="milestones" className="p-0">
                <div className="border-b border-border px-6 pt-4">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="amendments">Amendments</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="milestones" className="m-0 p-6">
                  <ol className="space-y-0">
                    {agreement.milestones.map((milestone, i) => (
                      <li key={milestone.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-medium",
                              milestone.status === "approved"
                                ? "border-success/40 bg-success/10 text-success"
                                : milestone.status === "disputed" || milestone.status === "rejected"
                                ? "border-danger/40 bg-danger/10 text-danger"
                                : milestone.status === "active" || milestone.status === "submitted" || milestone.status === "reviewing"
                                ? "border-foreground/30 bg-foreground/5 text-foreground"
                                : "border-border bg-surface-2 text-muted-2"
                            )}
                          >
                            {milestone.status === "approved" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              i + 1
                            )}
                          </div>
                          {i < agreement.milestones.length - 1 && (
                            <div
                              className={cn(
                                "w-px flex-1",
                                milestone.status === "approved" ? "bg-success/30" : "bg-border"
                              )}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {milestone.title}
                              </p>
                              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                                {milestone.description}
                              </p>
                            </div>
                            <MilestoneStatusBadge status={milestone.status} />
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-muted-2">
                            <span className="font-mono text-foreground">
                              {formatUsd(milestone.amount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due {formatDate(milestone.dueDate)}
                            </span>
                            {milestone.evidenceRequired && (
                              <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[11px]">
                                <FileStack className="h-3 w-3" /> evidence required
                              </Badge>
                            )}
                            {milestone.completedAt && (
                              <span>Completed {formatDate(milestone.completedAt)}</span>
                            )}
                          </div>
                          {(milestone.status === "submitted" || milestone.status === "reviewing") && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  toast.success("Milestone approved", {
                                    description: `${formatUsd(milestone.amount)} will be released to the provider.`,
                                  })
                                }
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  toast.warning("Milestone rejected", {
                                    description: "A dispute can be opened if the parties cannot agree.",
                                  })
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {milestone.status === "disputed" && mediation && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="mt-3"
                              asChild
                            >
                              <Link href={`/mediations/${mediation.id}`}>
                                <Scale className="h-3.5 w-3.5" /> Follow mediation
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </TabsContent>

                <TabsContent value="evidence" className="m-0 p-6">
                  <EvidenceTab agreement={agreement} />
                </TabsContent>

                <TabsContent value="activity" className="m-0 p-6">
                  <ActivityTab agreement={agreement} />
                </TabsContent>

                <TabsContent value="messages" className="m-0 p-6">
                  <MessagesTab agreement={agreement} />
                </TabsContent>

                <TabsContent value="amendments" className="m-0 p-6">
                  <AmendmentsTab amendments={amendments} onPropose={() => setAmending(true)} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px]">Funding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-2xl font-semibold text-foreground">
                      {formatUsd(agreement.fundedAmount)}
                    </p>
                    <p className="text-[12px] text-muted-2">
                      of {formatUsd(agreement.totalAmount)} total
                    </p>
                  </div>
                  <span className="font-mono text-sm text-muted">{fundedPct}%</span>
                </div>
                <Progress value={fundedPct} className="mt-3 h-2" />
              </div>

              <div className="rounded-md border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">Escrow address</span>
                  <button
                    onClick={() => copy(agreement.escrowAddress || "GQKG7O5C…I2IL", "Escrow address copied")}
                    className="flex items-center gap-1 font-mono text-foreground transition-colors hover:text-muted"
                  >
                    {formatAddress(agreement.escrowAddress || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", 6)}
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px]">
                  <span className="text-muted">Status</span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" /> Held by Pact program
                  </span>
                </div>
              </div>

              {agreement.status === "funding" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <CircleDollarSign /> Deposit {formatUsd(agreement.totalAmount - agreement.fundedAmount)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Fund agreement escrow</DialogTitle>
                      <DialogDescription>
                        Funding {formatUsd(agreement.totalAmount - agreement.fundedAmount)} of{" "}
                        {agreement.totalAmount.toLocaleString()} USDC into the escrow for{" "}
                        <span className="text-foreground">{agreement.code}</span>.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border border-border bg-surface-2 p-3 text-[13px]">
                      <div className="flex justify-between py-1">
                        <span className="text-muted">Amount to lock</span>
                        <span className="font-mono text-foreground">
                          {formatUsd(agreement.totalAmount - agreement.fundedAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted">Source</span>
                        <span className="font-mono text-muted">…sAsU</span>
                      </div>
                      <div className="flex justify-between border-t border-border py-1">
                        <span className="text-muted">Network fee</span>
                        <span className="font-mono text-muted">~$0.02</span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        className="w-full"
                        onClick={() => {
                          toast.success("Escrow funded", {
                            description: `${formatUsd(agreement.totalAmount)} locked. The agreement is now active.`,
                          });
                        }}
                      >
                        Confirm deposit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px]">Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agreement.parties.map((party) => (
                <div
                  key={party.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback
                      style={{
                        backgroundColor: `${party.avatarColor}22`,
                        color: party.avatarColor,
                      }}
                    >
                      {initials(party.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {party.name}
                      </p>
                      {party.verified && (
                        <span className="rounded bg-success/10 px-1 py-0.5 text-[10px] font-medium text-success">
                          verified
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copy(party.wallet, "Wallet address copied")}
                      className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-2 transition-colors hover:text-foreground"
                    >
                      {formatAddress(party.wallet)}
                      <Copy className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <Badge variant="muted" className="capitalize">
                    {party.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {mediation && (
            <Card className="border-warning/25">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-[15px]">
                  <span className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-warning" /> Mediation
                  </span>
                  <MediationStatusBadge status={mediation.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[13px] leading-relaxed text-muted">
                  {mediation.summary}
                </p>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">Disputed amount</span>
                  <span className="font-mono text-foreground">
                    {formatUsd(mediation.disputedAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">Mediator confidence</span>
                  <span className="font-mono text-foreground">
                    {Math.round(mediation.confidence * 100)}%
                  </span>
                </div>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/mediations/${mediation.id}`}>
                    Open mediation room <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ProposeAmendmentDialog
        agreement={agreement}
        open={amending}
        onOpenChange={setAmending}
        onPropose={proposeAmendment}
      />
    </div>
  );
}

function EvidenceTab({ agreement }: { agreement: Agreement }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Hashed, versioned, and timestamped submissions for this agreement.
        </p>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/evidence?agreement=${agreement.id}`}>
            <FileStack className="h-3.5 w-3.5" /> Submit evidence
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {agreement.milestones.flatMap((m) =>
          m.evidenceRequired
            ? [
                <div
                  key={`${m.id}-${m.title}`}
                  className="rounded-lg border border-border bg-surface-2 p-4"
                >
                  <p className="text-[12px] text-muted-2">{m.title}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {m.title.includes("Design") ? "Design system tokens (PDF)" : m.title.includes("Job") ? "Offline flow demo (video)" : m.title.includes("Terraform") ? "Terraform modules (repo)" : "Evidence file"}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-2">
                    <span className="rounded bg-success/10 px-1.5 py-0.5 font-medium text-success">
                      {m.status === "approved" ? "verified" : "awaiting"}
                    </span>
                    <span>v1 · {formatUsd(m.amount)}</span>
                  </div>
                </div>,
              ]
            : []
        )}
      </div>
    </div>
  );
}

function ActivityTab({ agreement }: { agreement: Agreement }) {
  const events = [
    { at: agreement.createdAt, title: "Agreement created", detail: `${agreement.code} drafted with ${agreement.milestones.length} milestones.` },
    { at: agreement.updatedAt, title: "Escrow updated", detail: `${formatUsd(agreement.fundedAmount)} of ${formatUsd(agreement.totalAmount)} locked.` },
    ...agreement.milestones
      .filter((m) => m.completedAt)
      .map((m) => ({
        at: m.completedAt!,
        title: `Milestone approved · ${m.title}`,
        detail: `${formatUsd(m.amount)} released to ${agreement.parties.find((p) => p.role === "provider")?.name}.`,
      })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <ol className="space-y-0">
      {events.map((event, i) => (
        <li key={i} className="flex gap-3.5">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-foreground/70" />
            {i < events.length - 1 && <div className="w-px flex-1 bg-border" />}
          </div>
          <div className={cn("flex-1", i < events.length - 1 && "pb-6")}>
            <p className="text-[13px] font-medium text-foreground">{event.title}</p>
            <p className="mt-0.5 text-[12px] text-muted-2">{event.detail}</p>
            <p className="mt-1 text-[11px] text-muted-2">{formatDateTime(event.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function MessagesTab({ agreement }: { agreement: Agreement }) {
  const messages = [
    {
      from: agreement.parties.find((p) => p.role === "provider")?.name ?? "Provider",
      at: agreement.updatedAt,
      text: `Thanks! ${agreement.milestones.filter((m) => m.status === "approved").length} milestones approved so far. Next submission will be uploaded by the end of the week.`,
    },
    {
      from: "Pact Mediator",
      at: agreement.createdAt,
      text: "Agreement escrow funded. Both parties can now submit evidence per milestone.",
      system: true,
    },
  ];

  return (
    <div className="space-y-4">
      {messages.map((m, i) => (
        <div key={i} className="flex gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
              m.system
                ? "border-border bg-foreground"
                : "border-border bg-surface-2"
            )}
          >
            {m.system ? (
              <MessageSquare className="h-3.5 w-3.5 text-black" />
            ) : (
              <span className="text-[10px] font-semibold text-foreground">
                {initials(m.from)}
              </span>
            )}
          </div>
          <div className="max-w-[85%] rounded-lg rounded-tl-sm border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-foreground">{m.from}</span>
              <span className="text-[11px] text-muted-2">{formatDateTime(m.at)}</span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{m.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingAmendmentCard({
  amendments,
  otherParty,
  onDecide,
}: {
  amendments: AgreementAmendment[];
  otherParty: string;
  onDecide: (id: string, approve: boolean) => void;
}) {
  return (
    <>
      {amendments
        .filter((a) => a.status === "pending")
        .map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-warning/25 bg-warning/[0.04] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                  <FilePenLine className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    Proposed by <span className="text-foreground">{a.proposedBy}</span> ·{" "}
                    {relativeTime(a.proposedAt)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-warning/30 text-warning">
                Pending approval
              </Badge>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">{a.summary}</p>
            <ul className="mt-3 space-y-1.5">
              {a.changes.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-1.5 text-[13px]">
                  <span className="text-muted">{c.field}:</span>
                  <span className="text-muted-2 line-through decoration-danger/60">
                    {c.from}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-2" />
                  <span className="text-foreground">{c.to}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] text-muted-2">
                Requires approval from both parties · awaiting {otherParty}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onDecide(a.id, false)}>
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
                <Button variant="success" size="sm" onClick={() => onDecide(a.id, true)}>
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            </div>
          </div>
        ))}
    </>
  );
}

function AmendmentsTab({
  amendments,
  onPropose,
}: {
  amendments: AgreementAmendment[];
  onPropose: () => void;
}) {
  if (amendments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-2">
          <FilePenLine className="h-4.5 w-4.5 text-muted" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No amendments yet</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            Terms can be changed after funding, but only with approval from both parties.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onPropose}>
          <Pencil className="h-3.5 w-3.5" /> Propose an amendment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...amendments]
        .sort((a, b) => new Date(b.proposedAt).getTime() - new Date(a.proposedAt).getTime())
        .map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-border bg-surface-2 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-2">
                  Proposed by {a.proposedBy} · {formatDateTime(a.proposedAt)}
                </p>
              </div>
              <AmendmentStatusPill status={a.status} />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{a.summary}</p>
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
              {a.changes.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-1.5 text-[13px]">
                  <span className="text-muted">{c.field}:</span>
                  <span className="text-muted-2 line-through decoration-danger/60">
                    {c.from}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-2" />
                  <span className="text-foreground">{c.to}</span>
                </li>
              ))}
            </ul>
            {a.decidedAt && a.decidedBy && (
              <p className="mt-3 text-[12px] text-muted-2">
                {a.status === "approved" ? "Approved" : "Rejected"} by {a.decidedBy} ·{" "}
                {formatDateTime(a.decidedAt)}
              </p>
            )}
          </div>
        ))}
    </div>
  );
}

function AmendmentStatusPill({ status }: { status: AgreementAmendment["status"] }) {
  const styles: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    approved: "bg-success/10 text-success",
    rejected: "bg-danger/10 text-danger",
  };
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[11px] font-medium capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function ProposeAmendmentDialog({
  agreement,
  open,
  onOpenChange,
  onPropose,
}: {
  agreement: Agreement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropose: (draft: {
    headline: string;
    summary: string;
    title: string;
    description: string;
    milestoneDueDates: Record<string, string>;
  }) => boolean;
}) {
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState(agreement.title);
  const [description, setDescription] = useState(agreement.description);
  const [dueDates, setDueDates] = useState<Record<string, string>>(() =>
    Object.fromEntries(agreement.milestones.map((m) => [m.id, m.dueDate.slice(0, 10)]))
  );
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setHeadline("");
    setSummary("");
    setTitle(agreement.title);
    setDescription(agreement.description);
    setDueDates(
      Object.fromEntries(agreement.milestones.map((m) => [m.id, m.dueDate.slice(0, 10)]))
    );
  };

  const submit = async () => {
    if (!headline.trim() || !summary.trim()) {
      toast.error("Add a title and a reason", {
        description: "Both parties need to understand what is changing and why.",
      });
      return;
    }
    const milestoneDueDates: Record<string, string> = {};
    agreement.milestones.forEach((m) => {
      const value = dueDates[m.id];
      if (value && value !== m.dueDate.slice(0, 10)) {
        milestoneDueDates[m.id] = new Date(`${value}T12:00:00Z`).toISOString();
      }
    });
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const proposed = onPropose({
      headline: headline.trim(),
      summary: summary.trim(),
      title: title.trim(),
      description: description.trim(),
      milestoneDueDates,
    });
    setSubmitting(false);
    if (proposed) {
      onOpenChange(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Propose an amendment</DialogTitle>
          <DialogDescription>
            Terms are flexible. Changes only take effect once both parties approve.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label htmlFor="amd-headline">Amendment title</Label>
            <Input
              id="amd-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Extend Milestone 2 deadline by two weeks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amd-summary">Reason for the change</Label>
            <Textarea
              id="amd-summary"
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Explain the change so both parties can review it."
            />
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted-2">
              Terms
            </p>
            <div className="space-y-2">
              <Label htmlFor="amd-title">Agreement title</Label>
              <Input
                id="amd-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amd-desc">Description</Label>
              <Textarea
                id="amd-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted-2">
              Milestone due dates
            </p>
            {agreement.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">{m.title}</p>
                  <p className="text-[11px] text-muted-2">{formatUsd(m.amount)}</p>
                </div>
                <input
                  type="date"
                  value={dueDates[m.id] ?? ""}
                  onChange={(e) =>
                    setDueDates((prev) => ({ ...prev, [m.id]: e.target.value }))
                  }
                  className="rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-foreground outline-none focus:border-foreground/50"
                />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Proposing…" : "Propose amendment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
