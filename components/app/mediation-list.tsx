"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  Gavel,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { Mediation } from "@/lib/types";
import { api, queryKeys } from "@/lib/api";
import { formatUsd, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { MediationStatusBadge } from "@/components/app/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const recommendationLabels: Record<string, string> = {
  release_funds: "Release funds",
  reject_claim: "Reject claim",
  partial_release: "Partial release",
  escalate: "Escalate to human",
};

export function MediationList() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.mediations,
    queryFn: api.mediations.list,
  });

  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    return status === "all" ? data : data.filter((m) => m.status === status);
  }, [data, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Mediator"
        description="Pact resolves disputes against the agreement, the evidence, and on-chain records."
      >
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-foreground" />
          Mediation-as-a-service
        </Badge>
      </PageHeader>

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">
          {filtered.length} open case{filtered.length === 1 ? "" : "s"}
        </p>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_review">In review</SelectItem>
            <SelectItem value="decided">Decided</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-2">
              <Gavel className="h-5 w-5 text-muted-2" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">No mediations</h3>
            <p className="mt-1 max-w-sm text-[13px] text-muted">
              Mediations open automatically when a milestone is disputed. You can also open one
              manually from any agreement.
            </p>
            <Button variant="secondary" className="mt-5" asChild>
              <Link href="/agreements">Browse agreements</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((mediation) => (
            <MediationCard key={mediation.id} mediation={mediation} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediationCard({ mediation }: { mediation: Mediation }) {
  const decided = mediation.status === "decided";

  return (
    <Link
      href={`/mediations/${mediation.id}`}
      className="group flex flex-col rounded-lg border border-border bg-surface transition-colors hover:border-foreground/25"
    >
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] text-muted-2">
              {mediation.agreementCode}
            </p>
            <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
              {mediation.title}
            </h3>
          </div>
          <MediationStatusBadge status={mediation.status} />
        </div>

        <p className="line-clamp-3 text-[13px] leading-relaxed text-muted">
          {mediation.summary}
        </p>

        <div className="mt-auto space-y-3 pt-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-2">Mediator confidence</span>
              <span className="font-mono text-foreground">
                {Math.round(mediation.confidence * 100)}%
              </span>
            </div>
            <Progress value={Math.round(mediation.confidence * 100)} className="h-1.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-2">
            <span className="flex items-center gap-1">
              <CircleDollarSign className="h-3.5 w-3.5" />
              <span className="font-mono text-foreground">{formatUsd(mediation.disputedAmount)}</span>
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDateTime(mediation.openedAt)}
            </span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              {mediation.disputedBy === "client" ? "Disputed by client" : "Disputed by provider"}
            </span>
          </div>

          {decided && mediation.decision ? (
            <div className="rounded-md border border-success/25 bg-success/5 px-3 py-2 text-[12px]">
              <span className="font-medium text-success">
                {recommendationLabels[mediation.decision.action]}
              </span>
              <span className="text-muted">
                {" "}· {formatUsd(mediation.decision.amount)} decided
              </span>
            </div>
          ) : (
            mediation.recommendation && (
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <Scale className="h-3.5 w-3.5 text-warning" />
                Trending toward{" "}
                <span className="font-medium text-foreground">
                  {recommendationLabels[mediation.recommendation]}
                </span>
              </div>
            )
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <span className="text-[12px] text-muted-2">
          {mediation.messages.length} messages · {mediation.submittedEvidence.length} evidence
        </span>
        <span className="flex items-center gap-1 text-[12px] font-medium text-foreground transition-transform group-hover:translate-x-0.5">
          Open case <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
