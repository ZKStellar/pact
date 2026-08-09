"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  LogOut,
  Wallet,
} from "lucide-react";
import { useWallet } from "@/components/wallet/wallet-provider";
import { cn, formatAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_ACCOUNTS = [
  {
    label: "Pact Labs treasury",
    address: "GQKG7O5CYIOML4ILEYGLCEL4XQP5CBP4S663WWQBVSRJCZO6SJDYI2IL",
  },
  {
    label: "Contributor 1",
    address: "GBKO5MCKBXUAHLWKNX7KPLOSXLPQVRZK2XR2NDJSERQWYMP6AIHEPWBA",
  },
  {
    label: "Contributor 2",
    address: "GBITWQWXYKGHL2R2F5PJ6CRU6LL4TASHR24DQN27HZM4TPO66CCND4T5",
  },
];

function hasFreighter() {
  return typeof window !== "undefined" && Boolean(window.freighterApi);
}

function supportsPasskey() {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

export function ConnectWallet() {
  const {
    address,
    connected,
    connecting,
    connect,
    signInWithPasskey,
    disconnect,
  } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const pick = async (addr?: string) => {
    const next = await connect(addr);
    if (next) {
      toast.success("Wallet connected", {
        description: formatAddress(next, 6),
      });
      setOpen(false);
    }
  };

  const passkey = async () => {
    try {
      const next = await signInWithPasskey();
      if (next) {
        toast.success("Signed in with passkey", {
          description: `Your wallet is ${formatAddress(next, 6)}`,
        });
        setOpen(false);
      }
    } catch (error) {
      toast.error("Passkey sign-in failed", {
        description:
          error instanceof Error
            ? error.message
            : "Check that this browser supports passkeys.",
      });
    }
  };

  if (connected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 text-[12px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <span className="font-mono">{formatAddress(address, 6)}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <p className="text-sm font-medium text-foreground">Connected wallet</p>
            <p className="mt-1 truncate font-mono text-[11px] font-normal text-muted-2">
              {address}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy address
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wallet">
              <ExternalLink className="h-4 w-4" /> View wallet
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={disconnect}>
            <LogOut className="h-4 w-4" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Wallet className="h-4 w-4" /> Connect wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign in to Pact</DialogTitle>
          <DialogDescription>
            Use a passkey with your fingerprint or face to create your wallet.
            No email or password.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[45dvh] space-y-1.5 overflow-y-auto pr-1">
          <button
            onClick={passkey}
            disabled={connecting || !supportsPasskey()}
            className="flex w-full items-center gap-3 rounded-lg bg-white px-3.5 py-3 text-left transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-black text-white">
              <Fingerprint className="h-4.5 w-4.5" />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-medium text-black">
                Sign in with passkey
              </span>
              <span className="block text-[11px] text-zinc-500">
                {connecting
                  ? "Waiting for your device…"
                  : supportsPasskey()
                    ? "Face ID, Touch ID, or platform key"
                    : "Not supported in this browser"}
              </span>
            </span>
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-wider text-muted-2">
              or use a test account
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {hasFreighter() && (
            <button
              onClick={() => pick()}
              disabled={connecting}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-2 px-3.5 py-3 text-left transition-colors hover:border-border-strong hover:bg-surface disabled:opacity-60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1a1a2e] font-mono text-[13px] font-bold text-[#a78bfa]">
                F
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-medium text-foreground">
                  Freighter
                </span>
                <span className="block text-[11px] text-muted-2">
                  Browser extension detected
                </span>
              </span>
              <CheckCircle2 className="h-4 w-4 text-muted-2" />
            </button>
          )}
          {MOCK_ACCOUNTS.map((account) => (
            <button
              key={account.address}
              onClick={() => pick(account.address)}
              disabled={connecting}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-2 px-3.5 py-3 text-left transition-colors hover:border-border-strong hover:bg-surface disabled:opacity-60"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface font-mono text-[10px] text-muted"
                )}
              >
                {account.label.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">
                  {account.label}
                </span>
                <span className="block truncate font-mono text-[11px] text-muted-2">
                  {account.address}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-2">
          Your passkey wallet address is derived from your credential, so it
          only exists on your device.
        </p>
      </DialogContent>
    </Dialog>
  );
}
