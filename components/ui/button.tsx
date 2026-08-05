import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.985]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
        secondary:
          "bg-surface-2 text-foreground border border-border hover:bg-[#1e1e1e] hover:border-border-strong",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface hover:border-border-strong",
        ghost: "text-muted hover:text-foreground hover:bg-surface",
        link: "text-foreground underline-offset-4 hover:underline",
        destructive:
          "bg-danger/10 text-danger border border-danger/25 hover:bg-danger/15",
        success:
          "bg-success text-black hover:brightness-110",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-[15px]",
        xl: "h-12 rounded-lg px-7 text-[15px]",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
