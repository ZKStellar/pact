"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  FileCheck,
  FileStack,
  Trophy,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { cn, formatUsd } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const metricIcons = {
  agreements: Activity,
  funds: CircleDollarSign,
  success: FileCheck,
  median: Clock3,
  resolution: Clock3,
  evidence: FileStack,
} as const;

const STATUS_COLORS = ["#22C55E", "#9E9E9E", "#F59E0B", "#3B82F6", "#6B7280", "#6B7280", "#6B7280"];
const SERIES_COLORS = ["#FFFFFF", "#22C55E", "#F59E0B", "#3B82F6"];

function TooltipCard({
  active,
  payload,
  label,
  money,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  money?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-[12px] shadow-xl">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-mono text-foreground">
            {money ? formatUsd(p.value) : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics,
    queryFn: api.analytics.get,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Portfolio performance across agreements, escrow, and dispute resolution."
      >
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live data
        </Badge>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {isLoading || !data
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-3 h-6 w-20" />
                </CardContent>
              </Card>
            ))
          : data.metrics.map((m, i) => {
              const Icon = metricIcons[["agreements", "funds", "success", "median", "resolution", "evidence"][i] as keyof typeof metricIcons];
              const positive = (m.delta ?? 0) >= 0;
              const key = ["agreements", "funds", "success", "median", "resolution", "evidence"][i];
              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2">
                        <Icon className="h-4 w-4 text-muted" />
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-[11px] font-medium",
                          positive ? "text-success" : "text-danger"
                        )}
                      >
                        {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(m.delta)}%
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-lg font-semibold text-foreground">
                      {key === "funds"
                        ? formatUsd(m.value)
                        : key === "success"
                        ? `${m.value}%`
                        : m.unit
                        ? `${m.value}d`
                        : m.value.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-2">{m.label}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Monthly volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px]">Monthly volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyVolume ?? []} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fundsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                  <Tooltip content={<TooltipCard money />} cursor={{ stroke: "#262626" }} />
                  <Area
                    type="monotone"
                    dataKey="fundsLocked"
                    name="Funds locked"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fill="url(#fundsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-end gap-4 text-[11px] text-muted-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" /> Funds locked
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px]">Agreement status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusDistribution ?? []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {(data?.statusDistribution ?? []).map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipCard />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {(data?.statusDistribution ?? []).map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                    {s.name}
                  </span>
                  <span className="font-mono text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Disputes & resolutions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px]">Disputes vs. resolutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyVolume ?? []} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<TooltipCard />} cursor={{ fill: "#171717" }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#9E9E9E" }} iconSize={8} />
                  <Bar dataKey="disputes" name="Disputes opened" fill="#F59E0B" radius={[3, 3, 0, 0]} barSize={14} />
                  <Bar dataKey="resolved" name="Resolved" fill="#22C55E" radius={[3, 3, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Settlement times */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px]">Time to settlement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {(data?.settlementTimes ?? []).map((s, i) => {
                const max = Math.max(...(data?.settlementTimes ?? []).map((x) => x.value), 1);
                return (
                  <div key={s.name}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted">{s.name}</span>
                      <span className="font-mono text-foreground">{s.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(s.value / max) * 100}%`,
                          backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length],
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top agreements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-[15px]">
            <Trophy className="h-4 w-4 text-muted-2" /> Top agreements by value
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {(data?.topAgreements ?? []).map((a, i) => (
              <div key={a.code} className="flex items-center gap-4 px-5 py-3.5">
                <span className="w-6 text-center font-mono text-[12px] text-muted-2">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{a.title}</p>
                  <p className="font-mono text-[11px] text-muted-2">{a.code}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    a.status === "disputed" && "border-warning/30 text-warning",
                    a.status === "active" && "border-success/30 text-success"
                  )}
                >
                  {a.status}
                </Badge>
                <span className="w-24 text-right font-mono text-[13px] text-foreground">
                  {formatUsd(a.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
