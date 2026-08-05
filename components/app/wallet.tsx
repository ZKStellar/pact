"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  LockKeyhole,
  QrCode,
  Send,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { TransactionType } from "@/lib/types";
import { api, queryKeys } from "@/lib/api";
import { formatUsd, formatDateTime, formatAddress, cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { TransactionStatusBadge } from "@/components/app/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

const typeMeta: Record<
  TransactionType,
  { label: string; icon: typeof Send; tone: string; bg: string }
> = {
  deposit: { label: "Deposit", icon: ArrowDownLeft, tone: "#22C55E", bg: "bg-success/10" },
  withdraw: { label: "Withdraw", icon: ArrowUpRight, tone: "#9E9E9E", bg: "bg-foreground/10" },
  lock: { label: "Escrow locked", icon: Lock, tone: "#3B82F6", bg: "bg-blue-500/10" },
  release: { label: "Milestone released", icon: TrendingUp, tone: "#22C55E", bg: "bg-success/10" },
  refund: { label: "Refund", icon: ArrowDownLeft, tone: "#F59E0B", bg: "bg-warning/10" },
  fee: { label: "Protocol fee", icon: LockKeyhole, tone: "#9E9E9E", bg: "bg-foreground/10" },
};

export function Wallet() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.walletSummary,
    queryFn: api.wallet.summary,
  });
  const { data: txns, isLoading: txnsLoading } = useQuery({
    queryKey: queryKeys.walletTransactions,
    queryFn: api.wallet.transactions,
  });

  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!txns) return [];
    return filter === "all" ? txns : txns.filter((t) => t.type === filter);
  }, [txns, filter]);

  const copy = (value: string, label = "Copied") => {
    navigator.clipboard.writeText(value);
    toast.success(label);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="Your Pact balance, escrow positions, and on-chain activity."
      >
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="font-mono text-[12px] text-muted">
            {summary ? formatAddress(summary.address, 5) : "…"}
          </span>
          <button
            onClick={() => summary && copy(summary.address, "Address copied")}
            className="text-muted-2 transition-colors hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Balance */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-foreground/[0.04] blur-3xl" />
              <p className="text-[13px] text-muted">Available balance</p>
              <p className="mt-2 font-mono text-4xl font-semibold tracking-tight text-foreground">
                {summaryLoading ? <Skeleton className="h-10 w-48" /> : formatUsd(summary?.available ?? 0)}
              </p>
              <p className="mt-1 text-[12px] text-muted-2">
                USDC on Solana mainnet · {summary?.reserved ? `${formatUsd(summary.reserved)} reserved` : ""}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <DepositDialog address={summary?.address} />
                <WithdrawDialog available={summary?.available ?? 0} />
                <Button variant="secondary" onClick={() => toast.info("Connecting to escrow program…")}>
                  <Lock className="h-4 w-4" /> Open escrow dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Locked in escrow" value={summary?.totalLocked} loading={summaryLoading} icon={Lock} />
            <StatCard label="Released all-time" value={summary?.released} loading={summaryLoading} icon={TrendingUp} />
            <StatCard label="Pending" value={summary?.pending} loading={summaryLoading} icon={Timer} />
            <StatCard label="Completed transfers" value={undefined} count={txns?.filter((t) => t.status === "completed").length} loading={txnsLoading} icon={CheckCircle2} />
          </div>

          {/* Transactions */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
              <p className="text-sm font-medium text-foreground">Transactions</p>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activity</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdraw">Withdrawals</SelectItem>
                  <SelectItem value="lock">Escrow locks</SelectItem>
                  <SelectItem value="release">Releases</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                  <SelectItem value="fee">Protocol fees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {txnsLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <QrCode className="h-6 w-6 text-muted-2" />
                <p className="mt-3 text-sm font-medium text-foreground">No transactions</p>
                <p className="mt-1 text-[13px] text-muted">Try a different filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((t) => {
                  const meta = typeMeta[t.type];
                  const Icon = meta.icon;
                  const positive = t.type === "deposit" || t.type === "release" || t.type === "refund";
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", meta.bg)} style={{ color: meta.tone }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-foreground">{meta.label}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-2">
                          {t.agreementCode ? `${t.agreementCode} · ` : ""}
                          {formatDateTime(t.at)} ·{" "}
                          <button
                            onClick={() => copy(t.txHash, "Transaction hash copied")}
                            className="font-mono hover:text-foreground"
                          >
                            {t.txHash.slice(0, 8)}…
                          </button>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn("font-mono text-[13px]", positive ? "text-success" : "text-foreground")}>
                          {positive ? "+" : "−"}{formatUsd(t.amount)}
                        </p>
                        <div className="mt-1 flex justify-end">
                          <TransactionStatusBadge status={t.status} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-8">
              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <QrPlaceholder />
              </div>
              <p className="mt-4 text-[13px] font-medium text-foreground">
                {summary ? formatAddress(summary.address, 8) : "…"}
              </p>
              <p className="mt-1 text-[11px] text-muted-2">
                Scan to deposit USDC to this address
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => summary && copy(summary.address, "Address copied")}>
                <Copy className="h-3.5 w-3.5" /> Copy address
              </Button>
            </CardContent>
          </Card>

          <Card>
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-medium text-foreground">Escrow breakdown</p>
            </div>
            <CardContent className="space-y-3 px-5 py-4">
              <EscrowRow label="Locked across agreements" value={summary?.totalLocked} loading={summaryLoading} />
              <EscrowRow label="Released to providers" value={summary?.released} loading={summaryLoading} />
              <EscrowRow label="Pending releases" value={summary?.pending} loading={summaryLoading} />
              <EscrowRow label="Reserved for fees" value={summary?.reserved} loading={summaryLoading} />
              <div className="rounded-md border border-border bg-surface-2 p-3 text-[12px] leading-relaxed text-muted">
                Escrowed funds are held by the Pact program and can only move via approved milestone
                releases or mediation decisions.
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-medium text-foreground">Network</p>
            </div>
            <CardContent className="px-5 py-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">Solana mainnet</span>
                <Badge variant="outline" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Operational
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="mt-3 w-full" asChild>
                <Link href="https://solscan.io" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> View on explorer
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  count,
  loading,
  icon: Icon,
}: {
  label: string;
  value?: number;
  count?: number;
  loading: boolean;
  icon: typeof Lock;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2">
          <Icon className="h-4 w-4 text-muted" />
        </div>
        <p className="mt-3 font-mono text-lg font-semibold text-foreground">
          {loading ? <Skeleton className="h-5 w-16" /> : value !== undefined ? formatUsd(value) : `${count ?? 0}`}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-2">{label}</p>
      </CardContent>
    </Card>
  );
}

function EscrowRow({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-foreground">
        {loading ? <Skeleton className="h-4 w-14" /> : formatUsd(value ?? 0)}
      </span>
    </div>
  );
}

function QrPlaceholder() {
  const cells = [
    "1111111001111",
    "1000001010001",
    "1011101001101",
    "1011101111101",
    "1011101001001",
    "1000001011101",
    "1111111010101",
    "0010100101100",
    "1101110111010",
    "1010010110110",
    "0101101001010",
    "1111010111010",
    "1011101010010",
  ];
  return (
    <div className="grid grid-rows-[repeat(13,1fr)] gap-px" aria-hidden>
      {cells.map((row, i) => (
        <div key={i} className="grid grid-cols-[repeat(13,1fr)] gap-px">
          {row.split("").map((c, j) => (
            <span key={j} className={cn("h-2.5 w-2.5", c === "1" ? "bg-foreground" : "bg-transparent")} />
          ))}
        </div>
      ))}
    </div>
  );
}

function DepositDialog({ address }: { address?: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!Number(amount)) {
      toast.error("Enter an amount", { description: "Use a valid USDC amount." });
      return;
    }
    setPending(true);
    await new Promise((r) => setTimeout(r, 1400));
    setPending(false);
    setOpen(false);
    setAmount("");
    toast.success("Deposit initiated", {
      description: `Scan the QR or use the wallet address to send ${formatUsd(Number(amount))} USDC.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowDownLeft className="h-4 w-4" /> Deposit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit USDC</DialogTitle>
          <DialogDescription>
            Send USDC from any wallet. Funds arrive in your available balance once confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-surface-2/50 px-6 py-6">
          <QrPlaceholder />
          <div className="flex w-full items-center justify-center gap-2">
            <span className="font-mono text-[13px] text-foreground">
              {address ? formatAddress(address, 8) : "…"}
            </span>
            <button
              onClick={() => {
                if (address) {
                  navigator.clipboard.writeText(address);
                  toast.success("Address copied");
                }
              }}
              className="text-muted-2 hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit-amount">Amount (optional)</Label>
          <Input
            id="deposit-amount"
            type="number"
            min={0}
            step={100}
            className="font-mono"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending} className="w-full">
            {pending ? "Awaiting confirmation…" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({ available }: { available: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter an amount");
      return;
    }
    if (amt > available) {
      toast.error("Insufficient balance", { description: `You have ${formatUsd(available)} available.` });
      return;
    }
    if (!address.trim()) {
      toast.error("Enter a destination address");
      return;
    }
    setPending(true);
    await new Promise((r) => setTimeout(r, 1400));
    setPending(false);
    setOpen(false);
    setAmount("");
    setAddress("");
    toast.success("Withdrawal submitted", {
      description: `${formatUsd(amt)} is being sent to ${address.slice(0, 6)}…${address.slice(-4)}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <ArrowUpRight className="h-4 w-4" /> Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw USDC</DialogTitle>
          <DialogDescription>
            Withdraw from your available balance to any Solana address.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-2">$</span>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min={0}
                  className="pl-7 font-mono"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAmount(String(available))}>
                Max
              </Button>
            </div>
            <p className="text-[11px] text-muted-2">
              Available: <span className="font-mono text-foreground">{formatUsd(available)}</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdraw-address">Destination address</Label>
            <Input
              id="withdraw-address"
              className="font-mono text-[13px]"
              placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending} className="w-full">
            {pending ? "Submitting…" : "Confirm withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
