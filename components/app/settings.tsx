"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  Check,
  CreditCard,
  KeyRound,
  PencilLine,
  ShieldCheck,
  User,
  Users,
  Wallet,
  Webhook,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import { formatAddress, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SectionId = "profile" | "organization" | "security" | "api-keys" | "notifications" | "billing" | "wallet" | "developer";

const sections: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "api-keys", label: "API keys", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "developer", label: "Developer", icon: Webhook },
];

const notificationPrefs = [
  { key: "milestones", label: "Milestone events", description: "Submissions, approvals, and auto-releases." },
  { key: "disputes", label: "Dispute & mediation", description: "Disputes opened, questions asked, and decisions." },
  { key: "evidence", label: "Evidence review", description: "New evidence, verifications, and hash confirmations." },
  { key: "escrow", label: "Escrow & wallet", description: "Funding, releases, and low-balance alerts." },
  { key: "security", label: "Security alerts", description: "Sign-ins, API key usage, and permission changes." },
  { key: "digest", label: "Weekly digest", description: "A Monday summary of portfolio activity." },
];

export function Settings() {
  const [section, setSection] = useState<SectionId>("profile");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    milestones: true,
    disputes: true,
    evidence: true,
    escrow: true,
    security: true,
    digest: false,
  });

  const { data: orgData, isLoading } = useQuery({
    queryKey: queryKeys.organization,
    queryFn: api.organization.get,
  });

  const user = orgData?.currentUser;
  const org = orgData?.organization;

  const saved = () => toast.success("Saved", { description: "Your changes were updated." });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, organization, and developer tools." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3">
            {user && (
              <Avatar className="h-9 w-9">
                <AvatarFallback style={{ backgroundColor: `${user.avatarColor}22`, color: user.avatarColor }}>
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">
                {user?.name ?? <Skeleton className="h-4 w-24" />}
              </p>
              <p className="truncate text-[11px] text-muted-2">{user?.email}</p>
            </div>
          </div>
          <nav className="mt-4 space-y-0.5">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-colors",
                    section === s.id
                      ? "bg-surface-2 font-medium text-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          {section === "profile" && (
            <ProfileSection
              user={user}
              loading={isLoading}
              onSave={saved}
            />
          )}
          {section === "organization" && (
            <OrganizationSection org={org} loading={isLoading} onSave={saved} />
          )}
          {section === "security" && <SecuritySection onSave={saved} />}
          {section === "api-keys" && <ApiKeysSection />}
          {section === "notifications" && (
            <NotificationsSection prefs={prefs} setPrefs={setPrefs} onSave={saved} />
          )}
          {section === "billing" && <BillingSection plan={org?.plan} onSave={saved} />}
          {section === "wallet" && <WalletSection address={org?.wallet ?? user?.wallet} />}
          {section === "developer" && <DeveloperSection onSave={saved} />}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-[15px]">{title}</CardTitle>
          {description && <p className="mt-0.5 text-[12px] text-muted">{description}</p>}
        </div>
        {actionLabel && onAction && (
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  id,
  defaultValue,
  hint,
  mono,
}: {
  label: string;
  id: string;
  defaultValue?: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} defaultValue={defaultValue} className={cn(mono && "font-mono text-[13px]")} />
      {hint && <p className="text-[11px] text-muted-2">{hint}</p>}
    </div>
  );
}

function ProfileSection({
  user,
  loading,
  onSave,
}: {
  user?: { name: string; email: string; role: string; joinedAt: string; avatarColor: string };
  loading: boolean;
  onSave: () => void;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }
  return (
    <>
      <SectionCard title="Profile" description="Your name, email, and account information." actionLabel="Save changes" onAction={onSave}>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback style={{ backgroundColor: `${user?.avatarColor}22`, color: user?.avatarColor }}>
              {user?.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="secondary" size="sm">
              <PencilLine className="h-3.5 w-3.5" /> Change avatar
            </Button>
            <p className="mt-1 text-[11px] text-muted-2">PNG or JPG, up to 2MB.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" id="name" defaultValue={user?.name} />
          <Field label="Email" id="email" defaultValue={user?.email} />
          <Field label="Role" id="role" defaultValue={user?.role} hint="Managed by your organization admin." />
          <Field label="Member since" id="joined" defaultValue={user?.joinedAt ? formatDate(user.joinedAt) : ""} />
        </div>
      </SectionCard>
    </>
  );
}

function OrganizationSection({
  org,
  loading,
  onSave,
}: {
  org?: { name: string; slug: string; domain: string; seats: number; members: number };
  loading: boolean;
  onSave: () => void;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }
  return (
    <>
      <SectionCard title="Organization" description="Your workspace identity on Pact." actionLabel="Save changes" onAction={onSave}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Organization name" id="org-name" defaultValue={org?.name} />
          <Field label="Slug" id="org-slug" defaultValue={org?.slug} hint="Used in API routes and public pages." mono />
          <Field label="Verified domain" id="org-domain" defaultValue={org?.domain} hint="Claimed via DNS TXT record." />
          <Field label="Members" id="org-members" defaultValue={`${org?.members} of ${org?.seats} seats`} />
        </div>
      </SectionCard>
      <SectionCard title="Members" description="People with access to this organization.">
        <div className="space-y-2">
          {[
            { name: "Jordan Reyes", email: "jordan@pactlabs.dev", role: "Owner" },
            { name: "Maya Chen", email: "maya@pactlabs.dev", role: "Admin" },
            { name: "Aden Patel", email: "aden@pactlabs.dev", role: "Developer" },
            { name: "Sofia Marino", email: "sofia@pactlabs.dev", role: "Developer" },
          ].map((m) => (
            <div key={m.email} className="flex items-center gap-3 rounded-md border border-border bg-surface-2/50 px-3 py-2.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-foreground">{m.name}</p>
                <p className="truncate text-[11px] text-muted-2">{m.email}</p>
              </div>
              <Badge variant="muted" className="px-2 py-0.5 text-[10px]">{m.role}</Badge>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast("Invite sent", { description: "An invite link was copied to your clipboard." })}>
          Invite member
        </Button>
      </SectionCard>
    </>
  );
}

function SecuritySection({ onSave }: { onSave: () => void }) {
  const [passkeys, setPasskeys] = useState(2);
  return (
    <>
      <SectionCard title="Password" description="Change your account password.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current password" id="cur-pass" />
          <div />
          <Field label="New password" id="new-pass" hint="At least 12 characters." />
          <Field label="Confirm new password" id="confirm-pass" />
        </div>
        <Button variant="secondary" size="sm" onClick={onSave}>Update password</Button>
      </SectionCard>
      <SectionCard title="Two-factor authentication" description="Require a passkey or authenticator app at sign-in.">
        <div className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-foreground">Passkeys</p>
            <p className="text-[12px] text-muted">{passkeys} passkeys registered across your devices.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPasskeys((n) => n + 1);
              toast.success("Passkey added", { description: "Your device was registered." });
            }}
          >
            Add passkey
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-foreground">Authenticator app</p>
            <p className="text-[12px] text-muted">Use a TOTP code in addition to your password.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </SectionCard>
      <SectionCard title="Sessions" description="Devices currently signed in to your account.">
        {[
          { device: "Safari · macOS", location: "San Francisco, US", current: true },
          { device: "Chrome · Linux", location: "Amsterdam, NL", current: false },
          { device: "iOS App", location: "San Francisco, US", current: false },
        ].map((s) => (
          <div key={s.device} className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">
                {s.device} {s.current && <Badge className="ml-1 px-1.5 py-0 text-[9px]">current</Badge>}
              </p>
              <p className="text-[12px] text-muted">{s.location}</p>
            </div>
            {!s.current && (
              <Button variant="ghost" size="sm" className="text-muted hover:text-danger" onClick={() => toast.success("Session revoked")}>
                Revoke
              </Button>
            )}
          </div>
        ))}
      </SectionCard>
    </>
  );
}

function ApiKeysSection() {
  const [keys] = useState([
    { name: "production backend", key: "pk_live_8f2hJ9kL3mQ4…", created: "2026-05-12", lastUsed: "2 min ago", active: true },
    { name: "staging", key: "pk_live_nZ7xQ2wR5vB1…", created: "2026-06-03", lastUsed: "1 hr ago", active: true },
    { name: "ci-bot", key: "pk_live_pT4yU7iK9oA2…", created: "2026-04-21", lastUsed: "3 days ago", active: false },
  ]);

  return (
    <SectionCard
      title="API keys"
      description="Keys for the Pact API. Rotate them regularly."
      actionLabel="Create key"
      onAction={() => toast("Key created", { description: "Copy it now; it won't be shown again." })}
    >
      {keys.map((k) => (
        <div key={k.key} className="flex items-center gap-4 rounded-md border border-border bg-surface-2/50 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-foreground">{k.name}</p>
              <span className={cn("h-1.5 w-1.5 rounded-full", k.active ? "bg-success" : "bg-muted-2")} />
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-muted-2">{k.key}</p>
          </div>
          <div className="text-right text-[11px] text-muted-2">
            <p>Created {k.created}</p>
            <p>Used {k.lastUsed}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-muted hover:text-danger" onClick={() => toast.warning("Key revoked", { description: `${k.name} can no longer authenticate.` })}>
            Revoke
          </Button>
        </div>
      ))}
      <div className="rounded-md border border-border bg-surface-2/50 p-3 text-[12px] leading-relaxed text-muted">
        Store keys in a secret manager. Never commit them to source. Pact scans public repos for
        exposed keys and auto-revokes them.
      </div>
    </SectionCard>
  );
}

function NotificationsSection({
  prefs,
  setPrefs,
  onSave,
}: {
  prefs: Record<string, boolean>;
  setPrefs: (p: Record<string, boolean>) => void;
  onSave: () => void;
}) {
  return (
    <SectionCard title="Notifications" description="Choose which events reach your email and in-app feed." actionLabel="Save changes" onAction={onSave}>
      {notificationPrefs.map((n) => (
        <div key={n.key} className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-2/50 px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-foreground">{n.label}</p>
            <p className="text-[12px] text-muted">{n.description}</p>
          </div>
          <Switch
            checked={prefs[n.key]}
            onCheckedChange={(v) => setPrefs({ ...prefs, [n.key]: v })}
          />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSave}
          className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-4 py-3 text-left"
        >
          <div>
            <p className="text-[13px] font-medium text-foreground">Email digests</p>
            <p className="text-[11px] text-muted">Daily + weekly</p>
          </div>
          <Check className="h-4 w-4 text-success" />
        </button>
        <button
          onClick={() => toast("Pushed to webhooks", { description: "All events forwarded to your endpoints." })}
          className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-4 py-3 text-left"
        >
          <div>
            <p className="text-[13px] font-medium text-foreground">Webhook delivery</p>
            <p className="text-[11px] text-muted">Real-time events</p>
          </div>
          <Webhook className="h-4 w-4 text-muted-2" />
        </button>
      </div>
    </SectionCard>
  );
}

function BillingSection({ plan, onSave }: { plan?: string; onSave: () => void }) {
  const [planName, setPlanName] = useState(plan ?? "Growth");
  const plans = [
    { name: "Starter", price: 0, desc: "3 active agreements, community support" },
    { name: "Growth", price: 249, desc: "Unlimited agreements, AI mediation, API" },
    { name: "Scale", price: 999, desc: "Dedicated escrow, SLA, priority mediation" },
  ];
  return (
    <>
      <SectionCard title="Plan" description="Your current Pact subscription.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {plans.map((p) => (
            <button
              key={p.name}
              onClick={() => setPlanName(p.name)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                planName === p.name
                  ? "border-foreground/40 bg-surface-2"
                  : "border-border bg-surface hover:border-foreground/25"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-foreground">{p.name}</p>
                {planName === p.name && <Check className="h-4 w-4 text-success" />}
              </div>
              <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                ${p.price}
                <span className="text-[11px] font-normal text-muted-2">/mo</span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{p.desc}</p>
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => { onSave(); toast.info("Plan updated", { description: `Switched to ${planName}.` }); }}>
          Update plan
        </Button>
      </SectionCard>
      <SectionCard title="Payment method" description="Used for subscription billing.">
        <div className="flex items-center gap-4 rounded-md border border-border bg-surface-2/50 px-4 py-3">
          <div className="flex h-10 w-14 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-black">
            VISA
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-foreground">Visa •••• 4242</p>
            <p className="text-[12px] text-muted">Expires 09/28</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast("Card added", { description: "A new card was linked." })}>
            Replace
          </Button>
        </div>
        <p className="text-[11px] text-muted-2">Billed monthly. Invoices are available in your org email.</p>
      </SectionCard>
    </>
  );
}

function WalletSection({ address }: { address?: string }) {
  return (
    <SectionCard title="Connected wallet" description="Your default wallet for signing and escrow.">
      <div className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-foreground">
            {address ? formatAddress(address, 8) : "Not connected"}
          </p>
          <p className="text-[12px] text-muted">Solana mainnet</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast.success("Wallet connected", { description: "Phantom connected successfully." })}>
          Connect wallet
        </Button>
      </div>
      <div className="rounded-md border border-border bg-surface-2/50 p-3 text-[12px] leading-relaxed text-muted">
        This wallet authorizes funding, milestone approvals, and dispute decisions. Rotate it in
        your security settings if it is compromised.
      </div>
    </SectionCard>
  );
}

function DeveloperSection({ onSave }: { onSave: () => void }) {
  const [webhooks] = useState([
    { url: "https://app.pactlabs.dev/pact/webhooks", events: ["milestone.approved", "dispute.opened", "escrow.funded"], active: true },
    { url: "https://hooks.slack.com/services/…", events: ["dispute.decided"], active: true },
  ]);
  return (
    <>
      <SectionCard title="Webhooks" description="Receive real-time events for agreements, disputes, and escrow." actionLabel="Add webhook" onAction={onSave}>
        {webhooks.map((w, i) => (
          <div key={i} className="space-y-2 rounded-md border border-border bg-surface-2/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="truncate font-mono text-[12px] text-foreground">{w.url}</p>
              <Switch defaultChecked={w.active} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {w.events.map((e) => (
                <Badge key={e} variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                  {e}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Webhook events" description="The full event catalog available for delivery.">
        <div className="grid grid-cols-2 gap-2">
          {["agreement.created", "agreement.funded", "milestone.approved", "milestone.rejected", "milestone.auto_released", "evidence.submitted", "evidence.verified", "dispute.opened", "dispute.question_asked", "dispute.decided", "escrow.released", "escrow.refunded", "wallet.withdrawn", "signin.created"].map((e) => (
            <code key={e} className="rounded bg-surface-2 px-2 py-1.5 font-mono text-[11px] text-muted">
              {e}
            </code>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
