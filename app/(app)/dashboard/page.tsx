"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Lock,
  FileSignature,
  Scale,
  CheckCircle2,
  ArrowRight,
  Plus,
  FileStack,
  Upload,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { formatUsd, relativeTime, cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EvidenceStatusBadge,
  MediationStatusBadge,
  TransactionStatusBadge,
} from "@/components/app/status-badge";
import { EmptyState } from "@/components/app/empty-state";

export default function DashboardPage() {
  const agreementsQ = useQuery({
    queryKey: queryKeys.agreements,
    queryFn: api.agreements.list,
  });
  const mediationsQ = useQuery({
    queryKey: queryKeys.mediations,
    queryFn: api.mediations.list,
  });
  const evidenceQ = useQuery({
    queryKey: queryKeys.evidence,
    queryFn: api.evidence.list,
  });
  const transactionsQ = useQuery({
    queryKey: queryKeys.walletTransactions,
    queryFn: api.wallet.transactions,
  });

  const loading = agreementsQ.isLoading;

  const agreements = agreementsQ.data ?? [];
  const totalLocked = agreements.reduce((s, a) => s + a.fundedAmount, 0);
  const activeCount = agreements.filter((a) => a.status === "active").length;
  const completedCount = agreements.filter((a) => a.status === "completed").length;
  const pendingMediations = mediationsQ.data?.filter(
    (m) => m.status === "open" || m.status === "in_review"
  ).length;
  const recentEvidence = (evidenceQ.data ?? []).slice(0, 4);
  const recentSettlements = (transactionsQ.data ?? [])
    .filter((t) => t.type === "release" || t.type === "refund")
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your agreements, escrows, and mediations."
      >
        <Button variant="secondary" asChild>
          <Link href="/wallet">
            <CircleDollarSign /> Deposit
          </Link>
        </Button>
        <Button asChild>
          <Link href="/agreements/new">
            <Plus /> New agreement
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total funds locked"
          value={formatUsd(totalLocked)}
          sub="Across active escrows"
          icon={Lock}
          delta={8.9}
          loading={loading}
        />
        <StatCard
          label="Active agreements"
          value={String(activeCount)}
          sub={`${completedCount} completed all-time`}
          icon={FileSignature}
          delta={12.4}
          loading={loading}
        />
        <StatCard
          label="Pending mediations"
          value={String(pendingMediations ?? 0)}
          sub="Being reviewed right now"
          icon={Scale}
          loading={loading}
        />
        <StatCard
          label="Completed agreements"
          value={String(completedCount)}
          sub={`$${formatUsd(280000)} settled to providers`}
          icon={CheckCircle2}
          delta={4.2}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[15px]">Recent settlements</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted" asChild>
                <Link href="/wallet">
                  View wallet <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {transactionsQ.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentSettlements.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                          t.type === "release"
                            ? "border-success/25 bg-success/10"
                            : "border-warning/25 bg-warning/10"
                        )}
                      >
                        {t.type === "release" ? (
                          <FileCheck2 className="h-4 w-4 text-success" />
                        ) : (
                          <Landmark className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {t.type === "release" ? "Milestone release" : "Escrow refund"}
                          {t.agreementCode && (
                            <span className="ml-1.5 font-mono text-[11px] text-muted-2">
                              {t.agreementCode}
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[12px] text-muted-2">
                          {t.to} · {relativeTime(t.at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-[13px] font-medium text-foreground">
                          {formatUsd(t.amount)}
                        </span>
                        <TransactionStatusBadge status={t.status} className="px-1.5 py-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[15px]">Recent evidence</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted" asChild>
                <Link href="/evidence">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {evidenceQ.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentEvidence.map((e) => (
                    <Link
                      key={e.id}
                      href="/evidence"
                      className="flex items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2">
                        <FileStack className="h-4 w-4 text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {e.title}
                        </p>
                        <p className="truncate text-[12px] text-muted-2">
                          {e.submittedBy} · v{e.version} · {e.size}
                        </p>
                      </div>
                      <EvidenceStatusBadge status={e.status} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-[15px]">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "New agreement", icon: Plus, href: "/agreements/new", primary: true },
                { label: "Submit evidence", icon: Upload, href: "/evidence" },
                { label: "Deposit funds", icon: CircleDollarSign, href: "/wallet" },
                { label: "Review mediations", icon: Scale, href: "/mediations" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-colors",
                    action.primary
                      ? "border-white bg-white text-black hover:bg-zinc-200"
                      : "border-border bg-surface hover:border-border-strong"
                  )}
                >
                  <action.icon
                    className={cn(
                      "h-4 w-4",
                      action.primary ? "text-black" : "text-muted"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[13px] font-medium",
                      action.primary ? "text-black" : "text-foreground"
                    )}
                  >
                    {action.label}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[15px]">Active mediations</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted" asChild>
                <Link href="/mediations">
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {mediationsQ.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (mediationsQ.data ?? []).filter((m) => m.status !== "decided").length === 0 ? (
                <EmptyState
                  icon={Scale}
                  title="No open mediations"
                  description="When a dispute is opened, the Pact Mediator starts reviewing it immediately."
                />
              ) : (
                <div className="space-y-3">
                  {(mediationsQ.data ?? [])
                    .filter((m) => m.status !== "decided")
                    .map((m) => (
                      <Link
                        key={m.id}
                        href={`/mediations/${m.id}`}
                        className="block rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-border-strong"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-medium text-foreground">
                            {m.title}
                          </p>
                          <MediationStatusBadge status={m.status} />
                        </div>
                        <p className="mt-1 truncate font-mono text-[11px] text-muted-2">
                          {m.agreementCode}
                        </p>
                        <p className="mt-2 text-[12px] text-muted">
                          {formatUsd(m.disputedAmount)} disputed · {Math.round(m.confidence * 100)}% confidence
                        </p>
                      </Link>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <ShieldCheck className="h-4 w-4 text-success" />
                Escrow health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">Program audit</span>
                <span className="text-success">Passed · Aug 2026</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="text-muted">Settlements today</span>
                <span className="text-foreground">3</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="text-muted">Avg. settlement time</span>
                <span className="text-foreground">12 days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
