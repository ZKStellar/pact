"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Wallet,
  CircleHelp,
  Plus,
  Scale,
  FileStack,
  Wallet as WalletIcon,
  FileSignature,
  ShieldCheck,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { currentUser } from "@/lib/data/organization";
import { cn, relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const notificationIcons = {
  agreement: FileSignature,
  mediation: Scale,
  evidence: FileStack,
  wallet: WalletIcon,
  system: ShieldCheck,
} as const;

export function Topbar() {
  const router = useRouter();
  const { data: notifications, isLoading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.notifications.list,
  });

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("pact:open-command"));
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="lg:hidden">
            <Menu className="h-[18px] w-[18px]" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <button
        onClick={() => document.dispatchEvent(new CustomEvent("pact:open-command"))}
        className="hidden h-8 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm text-muted-2 transition-colors hover:border-border-strong hover:text-muted md:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-2">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
          asChild
        >
          <Link href="/agreements/new">
            <Plus /> New agreement
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
              <span>Notifications</span>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">
                {unread} unread
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[360px] overflow-y-auto px-1 pb-1">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-2 py-2.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              {notifications?.map((n) => {
                const Icon = notificationIcons[n.type];
                const content = (
                  <button
                    key={n.id}
                    onClick={() => n.actionHref && router.push(n.actionHref)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-surface-2",
                      !n.read && "bg-surface-2/40"
                    )}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2">
                      <Icon className="h-3.5 w-3.5 text-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[13px] font-medium leading-snug text-foreground">
                        <span className="truncate">{n.title}</span>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-info" />
                        )}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                        {n.description}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-2">
                        {relativeTime(n.at)}
                      </p>
                    </div>
                  </button>
                );
                return content;
              })}
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                View all
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-surface">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[#8b5cf6]/15 text-[11px] text-[#c4b5fd]">
                  JR
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-2 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs font-normal text-muted-2">{currentUser.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/security">
                <ShieldCheck /> Security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/wallet">
                <Wallet /> Wallet
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/api-keys">
                <Settings /> API keys
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/api-docs">
                <CircleHelp /> Documentation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive asChild>
              <Link href="/login">
                <LogOut /> Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
