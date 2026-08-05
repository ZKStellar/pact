"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  KeyRound,
  Package,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { CodeBlock } from "@/components/app/code-block";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const methodColor: Record<string, { text: string; bg: string; border: string }> = {
  GET: { text: "text-success", bg: "bg-success/10", border: "border-success/30" },
  POST: { text: "text-info", bg: "bg-info/10", border: "border-info/30" },
  PUT: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  PATCH: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  DELETE: { text: "text-danger", bg: "bg-danger/10", border: "border-danger/30" },
};

export function ApiDocs() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.docs,
    queryFn: api.docs.get,
  });

  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Reference"
        description="Build programmable agreements on top of Pact. Every endpoint maps to an on-chain escrow instruction."
      >
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> v1 · mainnet-ready
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-3">
              <nav className="space-y-0.5">
                <SidebarItem href="#quickstart" label="Quickstart" active={selected === -2} />
                <SidebarItem href="#authentication" label="Authentication" active={selected === -1} />
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                  Endpoints
                </p>
                {data?.endpoints.map((ep, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelected(i);
                      document.getElementById(`endpoint-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left font-mono text-[12px] transition-colors",
                      selected === i
                        ? "bg-surface-2 text-foreground"
                        : "text-muted hover:bg-surface hover:text-foreground"
                    )}
                  >
                    <span className={cn("text-[10px] font-bold", methodColor[ep.method].text)}>
                      {ep.method}
                    </span>
                    <span className="truncate">{ep.path}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2">
                <Zap className="h-4 w-4 text-warning" />
              </div>
              <p className="text-[12px] leading-snug text-muted">
                Prefer TypeScript? Install the{" "}
                <span className="font-mono text-foreground">@pact/sdk</span> for typed clients and
                webhook helpers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          {isLoading || !data ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <section id="quickstart" className="scroll-mt-24 space-y-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Package className="h-5 w-5 text-muted-2" /> Quickstart
                </h2>
                <p className="text-[13px] leading-relaxed text-muted">
                  Install the SDK and create your first agreement in under a minute.
                </p>
                <CodeBlock code={data.sdkInstall} language="bash" />
                <CodeBlock code={data.sdkInit} language="ts" />
              </section>

              <section id="authentication" className="scroll-mt-24 space-y-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <KeyRound className="h-5 w-5 text-muted-2" /> Authentication
                </h2>
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-2/50 px-3 py-2.5 text-[12px]">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span className="text-muted">
                    All requests require a secret key, passed as{" "}
                    <code className="rounded bg-foreground/10 px-1 font-mono text-foreground">
                      Authorization: Bearer pk_live_…
                    </code>
                  </span>
                  <span className="ml-auto">
                    <CreateKeyDialog />
                  </span>
                </div>
                <CodeBlock code={data.auth} language="bash" />
              </section>

              {data.endpoints.map((ep, i) => {
                const mc = methodColor[ep.method];
                return (
                  <section key={i} id={`endpoint-${i}`} className="scroll-mt-24 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 font-mono text-[11px] font-bold",
                          mc.bg,
                          mc.border,
                          mc.text
                        )}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-[14px] text-foreground">{ep.path}</span>
                      <Badge variant="muted" className="ml-auto px-2 py-0.5 text-[10px]">
                        {ep.auth}
                      </Badge>
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted">{ep.description}</p>
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-2">
                        {ep.example}
                      </p>
                      <CodeBlock code={ep.code} language="ts" />
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] transition-colors",
        active ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
      )}
    >
      {label}
    </a>
  );
}

function CreateKeyDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [created, setCreated] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim()) {
      toast.error("Name your key");
      return;
    }
    await new Promise((r) => setTimeout(r, 900));
    const key = `pk_live_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 14)}`;
    setCreated(key);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setCreated(null);
          setName("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <KeyRound className="h-3.5 w-3.5" /> Create API key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an API key</DialogTitle>
          <DialogDescription>
            Keys are shown once. Store them in a secret manager — do not commit them to source.
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your new key</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={created} className="font-mono text-[12px]" />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(created);
                    toast.success("Key copied");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-md border border-warning/25 bg-warning/5 px-3 py-2.5 text-[12px] text-warning">
              This key grants access to your agreements, escrow, and dispute actions. Keep it
              secure.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. production backend"
            />
          </div>
        )}
        <div className="flex justify-end">
          {created ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <Button onClick={create}>Generate key</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
