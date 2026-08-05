import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-border bg-surface-2 text-foreground",
        outline: "border-border text-muted",
        success:
          "border-success/25 bg-success/10 text-success",
        warning:
          "border-warning/25 bg-warning/10 text-warning",
        danger:
          "border-danger/25 bg-danger/10 text-danger",
        info: "border-info/25 bg-info/10 text-info",
        muted: "border-border bg-transparent text-muted-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
