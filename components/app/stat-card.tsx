import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  delta?: number;
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  delta,
  loading,
  onClick,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn("p-5 transition-colors", onClick && "cursor-pointer hover:border-border-strong")}
      {...(onClick ? { onClick } : {})}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted">{label}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {sub && <p className="mt-1 text-[12px] text-muted-2">{sub}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2">
            <Icon className="h-4 w-4 text-foreground" />
          </div>
          {delta !== undefined && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-[11px] font-medium",
                delta >= 0 ? "text-success" : "text-danger"
              )}
            >
              {delta >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
