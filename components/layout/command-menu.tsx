"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FileSignature,
  Scale,
  FileStack,
  Wallet,
  BarChart3,
  Braces,
  Settings,
  Plus,
  Search,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";
import { agreements } from "@/lib/data/agreements";

export function CommandMenu({
  open: controlledOpen,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const open = controlledOpen;
  const setOpen = onOpenChange;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search agreements, mediations, or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run("/dashboard")}>
            <LayoutDashboard /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run("/agreements")}>
            <FileSignature /> Agreements
          </CommandItem>
          <CommandItem onSelect={() => run("/mediations")}>
            <Scale /> Mediations
          </CommandItem>
          <CommandItem onSelect={() => run("/evidence")}>
            <FileStack /> Evidence
          </CommandItem>
          <CommandItem onSelect={() => run("/wallet")}>
            <Wallet /> Wallet
          </CommandItem>
          <CommandItem onSelect={() => run("/analytics")}>
            <BarChart3 /> Analytics
          </CommandItem>
          <CommandItem onSelect={() => run("/api-docs")}>
            <Braces /> API
          </CommandItem>
          <CommandItem onSelect={() => run("/settings")}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run("/agreements/new")}>
            <Plus /> Create agreement
          </CommandItem>
          <CommandItem onSelect={() => run("/wallet")}>
            <CircleDollarSign /> Deposit funds
          </CommandItem>
          <CommandItem onSelect={() => run("/settings/security")}>
            <ShieldCheck /> Security settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent agreements">
          {agreements.slice(0, 5).map((ag) => (
            <CommandItem key={ag.id} onSelect={() => run(`/agreements/${ag.id}`)}>
              <Search />
              <span className="flex-1 truncate">{ag.title}</span>
              <span className="font-mono text-[11px] text-muted-2">{ag.code}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
