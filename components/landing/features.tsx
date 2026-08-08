import {
  Lock,
  Milestone,
  Scale,
  FileCheck2,
  Braces,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Lock,
    title: "Funds held in program escrow",
    description:
      "Agreement value is locked in a program-verified escrow on Stellar. Neither party can move funds without following the terms you both agreed to.",
  },
  {
    icon: Milestone,
    title: "Milestone-driven payments",
    description:
      "Break any agreement into milestones with amounts, deadlines, and acceptance criteria. Funds release only when evidence meets the criteria.",
  },
  {
    icon: FileCheck2,
    title: "Verifiable evidence",
    description:
      "Submit GitHub PRs, repositories, websites, files, and media. Every submission is hashed, versioned, and timestamped on-chain.",
  },
  {
    icon: Scale,
    title: "Impartial AI mediator",
    description:
      "When a dispute opens, the Pact Mediator begins reviewing immediately, weighing evidence against your criteria and explaining every step.",
  },
  {
    icon: Braces,
    title: "Programmable by design",
    description:
      "Create, fund, and settle agreements through a typed SDK and REST API. Embed assurance into your own product in an afternoon.",
  },
  {
    icon: Activity,
    title: "Transparent by default",
    description:
      "Every funding, release, review, and decision is recorded in an immutable activity feed visible to all parties.",
  },
];

export function Features() {
  return (
    <section id="product" className="border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-wider text-muted-2">
            Why Pact
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Move past trust and manual admin.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Pact encodes the terms of an agreement, funding, milestones,
            evidence, and mediation, into a system both parties can verify.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-background p-7 transition-colors hover:bg-surface"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2 transition-colors group-hover:border-border-strong">
                <f.icon className="h-[18px] w-[18px] text-foreground" />
              </div>
              <h3 className="mt-5 text-[15px] font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
