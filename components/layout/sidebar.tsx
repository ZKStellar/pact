"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSignature,
  Scale,
  FileStack,
  Wallet,
  BarChart3,
  Braces,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PactLogo } from "@/components/app/pact-logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agreements", label: "Agreements", icon: FileSignature },
  { href: "/mediations", label: "Mediations", icon: Scale },
  { href: "/evidence", label: "Evidence", icon: FileStack },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/api-docs", label: "API", icon: Braces },
];

const bottomNav = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const content = (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-surface-2 text-foreground"
          : "text-muted hover:bg-surface hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-foreground" : "text-muted-2 group-hover:text-foreground"
        )}
      />
      {!collapsed && <span>{label}</span>}
      {active && !collapsed && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />
      )}
    </Link>
  );

  if (!collapsed) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-[#0c0c0c]">
      <div className={cn("flex h-14 shrink-0 items-center gap-2.5 px-4", collapsed && "justify-center px-0")}>
        <PactLogo size={22} />
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight">Pact</span>
        )}
      </div>

      <nav className={cn("flex-1 space-y-0.5 px-3 py-2", collapsed && "px-2")}>
        {nav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
        <div className={cn("py-2", !collapsed && "border-b border-border")} />
        {bottomNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className={cn("space-y-1 border-t border-border p-3", collapsed && "px-2")}>
        <Link
          href="/agreements/new"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-success/90 transition-colors hover:bg-surface",
            collapsed && "justify-center px-0"
          )}
        >
          <PlusIcon />
          {!collapsed && "New agreement"}
        </Link>
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-[11px] font-semibold text-[#c4b5fd]">
            JR
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium leading-tight">
                Jordan Reyes
              </p>
              <p className="truncate text-[11px] text-muted-2">Pact Labs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
