import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-2">
        <Icon className="h-5 w-5 text-muted" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {(actionLabel && onAction) || (actionLabel && actionHref) ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onAction}
          {...(actionHref ? { asChild: true } : {})}
        >
          {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
