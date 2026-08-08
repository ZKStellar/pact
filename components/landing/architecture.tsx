import { Braces, Scale, Boxes, ArrowDown } from "lucide-react";

const layers = [
  {
    icon: Braces,
    name: "Developer layer",
    items: ["REST API", "TypeScript SDK", "Webhooks", "Dashboard"],
    accent: "text-foreground",
  },
  {
    icon: Scale,
    name: "Protocol layer",
    items: ["Agreement program", "Escrow & milestones", "Evidence registry", "AI mediator"],
    accent: "text-foreground",
  },
  {
    icon: Boxes,
    name: "Settlement layer",
    items: ["Solana mainnet", "USDC (SPL)", "Program-derived escrow", "On-chain records"],
    accent: "text-foreground",
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-wider text-muted-2">
              Architecture
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Agreement logic on-chain, assurance everywhere.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              The Pact program is the single source of truth for every
              agreement. Funds, milestones, evidence, and decisions live on
              Solana, which means the outcome is auditable by anyone and
              cannot be edited after the fact.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  title: "Escrow is a program, not a wallet",
                  body: "Funds are controlled by the Pact program's logic, not by any individual. Releasing requires a valid path through the state machine.",
                },
                {
                  title: "Evidence is anchored on-chain",
                  body: "Every submission is content-hashed and committed to the ledger, creating a tamper-evident record that mediators and courts can verify.",
                },
                {
                  title: "Mediation starts the moment a dispute does",
                  body: "The mediator doesn't wait for humans to review. It evaluates evidence against your criteria and documents its reasoning.",
                },
              ].map((point) => (
                <li key={point.title} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {point.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {point.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between border-b border-border px-2 pb-3">
              <span className="text-sm font-semibold text-foreground">
                Pact stack
              </span>
              <span className="font-mono text-[11px] text-muted-2">
                pact.sh/v1
              </span>
            </div>

            <div className="mt-5 space-y-0">
              {layers.map((layer, i) => (
                <div key={layer.name}>
                  <div className="rounded-lg border border-border bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2">
                          <layer.icon className="h-4 w-4 text-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {layer.name}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {layer.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  {i < layers.length - 1 && (
                    <div className="flex justify-center py-2.5">
                      <ArrowDown className="h-4 w-4 text-muted-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
