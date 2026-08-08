"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  FileSignature,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  Archive,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { formatUsd, formatDate, cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import {
  AgreementStatusBadge,
  MilestoneStatusBadge,
} from "@/components/app/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/empty-state";
import { initials } from "@/lib/utils";
import type { AgreementStatus } from "@/lib/types";

const PAGE_SIZE = 8;

const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "funding", label: "Funding" },
  { value: "active", label: "Active" },
  { value: "disputed", label: "Disputed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

export default function AgreementsPage() {
  const { data: agreements, isLoading } = useQuery({
    queryKey: queryKeys.agreements,
    queryFn: api.agreements.list,
  });

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<"updated" | "amount" | "created">("updated");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!agreements) return [];
    let items = [...agreements];
    if (status !== "all") {
      items = items.filter((a) => a.status === (status as AgreementStatus));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.parties.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    items.sort((a, b) => {
      if (sort === "amount") return b.totalAmount - a.totalAmount;
      if (sort === "created")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return items;
  }, [agreements, status, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const allSelected =
    pageItems.length > 0 && pageItems.every((a) => selected.has(a.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) {
      pageItems.forEach((a) => next.delete(a.id));
    } else {
      pageItems.forEach((a) => next.add(a.id));
    }
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const bulkAction = (label: string) => {
    toast.success(label, {
      description: `${selected.size} agreement${selected.size === 1 ? "" : "s"} ${label.toLowerCase()}.`,
    });
    setSelected(new Set());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agreements"
        description="Every agreement you're party to, with live escrow and milestone state."
      >
        <Button asChild>
          <Link href="/agreements/new">
            <Plus /> New agreement
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, code, or party…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-muted-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as typeof sort)}
            >
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last updated</SelectItem>
                <SelectItem value="amount">Highest amount</SelectItem>
                <SelectItem value="created">Newest created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-4 py-2.5">
            <p className="text-[13px] text-muted">
              <span className="font-medium text-foreground">{selected.size}</span>{" "}
              selected
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => bulkAction("Archived")}
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => bulkAction("Cancelled")}
              >
                <Trash2 className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[250px]">Agreement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Milestones</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Updated</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                  <TableCell />
                </TableRow>
              ))}

            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <EmptyState
                    icon={FileSignature}
                    title={query || status !== "all" ? "No matching agreements" : "No agreements yet"}
                    description={
                      query || status !== "all"
                        ? "Try adjusting your search or filters."
                        : "Create your first agreement to start escrowing work."
                    }
                    actionLabel={query || status !== "all" ? undefined : "Create agreement"}
                    actionHref={query || status !== "all" ? undefined : "/agreements/new"}
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            )}

            {pageItems.map((ag) => {
              const provider = ag.parties.find((p) => p.role === "provider");
              const approved = ag.milestones.filter(
                (m) => m.status === "approved"
              ).length;
              const hasDispute = ag.status === "disputed";
              return (
                <TableRow key={ag.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selected.has(ag.id)}
                      onCheckedChange={() => toggleOne(ag.id)}
                      aria-label={`Select ${ag.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/agreements/${ag.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2">
                        <FileSignature className="h-3.5 w-3.5 text-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
                          {ag.title}
                        </p>
                        <p className="font-mono text-[11px] text-muted-2">
                          {ag.code}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <AgreementStatusBadge status={ag.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          style={{ backgroundColor: `${provider?.avatarColor}22`, color: provider?.avatarColor }}
                          className="text-[10px]"
                        >
                          {provider ? initials(provider.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-[13px] text-muted">
                        {provider?.name ?? "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-muted">
                        {approved}/{ag.milestones.length}
                      </span>
                      {hasDispute && (
                        <MilestoneStatusBadge status="disputed" className="px-1.5 py-0" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] text-foreground">
                    {formatUsd(ag.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right text-[13px] text-muted">
                    {formatDate(ag.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{ag.code}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toast.success("Link copied", { description: `${window.location.origin}/agreements/${ag.id}` })}>
                          <Copy /> Copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/agreements/${ag.id}`}>
                            <ExternalLink /> Open agreement
                          </Link>
                        </DropdownMenuItem>
                        {ag.status === "disputed" && (
                          <DropdownMenuItem asChild>
                            <Link href="/mediations">
                              <FileSignature /> View mediation
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onClick={() =>
                            toast.error("Agreement cancelled", {
                              description: `${ag.title} was cancelled and escrow refunded.`,
                            })
                          }
                        >
                          <Trash2 /> Cancel agreement
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-[12px] text-muted-2">
              Showing{" "}
              <span className="font-medium text-muted">
                {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of {filtered.length} agreements
            </p>
            <Pagination className="w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.max(1, current - 1));
                    }}
                    className={cn(current === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages })
                  .slice(0, 5)
                  .map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={current === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.min(totalPages, current + 1));
                    }}
                    className={cn(current === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
