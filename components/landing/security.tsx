import { ShieldCheck, Fingerprint, FileSearch, Bug } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SecurityItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const items: SecurityItem[] = [
  {
    icon: Fingerprint,
    title: "Program-derived escrow",
    description:
      "Escrow accounts are program-derived and can only be spent through valid agreement transitions, never by a wallet key.",
  },
  {
    icon: FileSearch,
    title: "Publicly verifiable",
    description:
      "Every escrow, evidence hash, and decision is on-chain. Any third party can verify a settlement without trusting Pact.",
  },
  {
    icon: Bug,
    title: "Audited & fuzzed",
    description:
      "The Pact program undergoes independent audits and continuous invariant fuzzing before each deployment.",
  },
  {
    icon: ShieldCheck,
    title: "Non-custodial by default",
    description:
      "Pact never takes custody. Funds sit in agreement escrows and your own wallet. We just enforce the terms.",
  },
];

export function Security() {
  return (
    <section id="security" className="border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-wider text-muted-2">
            Security
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Built so you never have to ask “can I trust them?”
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            The agreement, not any party, is in control. Pact enforces the
            terms you both signed.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-border-strong"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2">
                <item.icon className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
