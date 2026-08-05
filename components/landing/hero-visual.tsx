import { Scale, CheckCircle2 } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-8 -top-10 bottom-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_65%)]" />
      <div className="relative overflow-hidden rounded-xl border border-border bg-[#0c0c0c] shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-[11px] text-muted-2">
              app.pact.sh/agreements/agr_beta
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-warning/25 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
              <span className="h-1 w-1 rounded-full bg-warning" />
              Dispute in review
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-border p-6 sm:border-b-0 sm:border-r">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-2">
                  Agreement · PACT-2026-0117
                </p>
                <p className="mt-1 text-[15px] font-semibold">
                  Mobile App Development
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2">
                <Scale className="h-4 w-4 text-foreground" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Funded in escrow</span>
                <span className="font-mono text-foreground">$86,000.00</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full w-full rounded-full bg-white" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-2">
                <span>100% funded</span>
                <span>Milestone 3 of 4 disputed</span>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              {[
                { name: "Core Job Flow", amount: "$26,000", state: "done" },
                { name: "Sync Engine & Scheduling", amount: "$24,000", state: "disputed" },
                { name: "Push Notifications", amount: "$18,000", state: "pending" },
              ].map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    {m.state === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : m.state === "disputed" ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-danger/40 bg-danger/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                      </span>
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-border" />
                    )}
                    <span
                      className={`text-[13px] ${
                        m.state === "disputed"
                          ? "font-medium text-foreground"
                          : "text-muted"
                      }`}
                    >
                      {m.name}
                    </span>
                  </div>
                  <span className="font-mono text-[12px] text-muted-2">
                    {m.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <MediatorPane />
        </div>
      </div>
    </div>
  );
}

function MediatorPane() {
  const steps = [
    {
      icon: <span className="h-2 w-2 rounded-full bg-success" />,
      title: "Evidence submitted",
      detail: "PR #312 · staging run · heap profile",
    },
    {
      icon: <span className="h-2 w-2 rounded-full bg-info" />,
      title: "Acceptance criterion 3.4",
      detail: "12MB heap limit — not satisfied",
    },
    {
      icon: <span className="h-2 w-2 rounded-full bg-warning" />,
      title: "Recommendation drafted",
      detail: "Partial release · 70%",
    },
  ];

  return (
    <div className="flex flex-col p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground">
          <Scale className="h-3.5 w-3.5 text-black" />
        </div>
        <div>
          <p className="text-[13px] font-semibold leading-none">Pact Mediator</p>
          <p className="mt-0.5 text-[11px] text-muted-2">
            Reviewing evidence · 86% confidence
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface p-3.5">
        <p className="text-[12px] leading-relaxed text-muted">
          <span className="text-foreground">Finding:</span> the staging run
          passes CI, but the client reproduction shows 2 of 500 records dropped
          at the documented 12MB heap limit — a direct failure of acceptance
          criterion 3.4.
        </p>
      </div>

      <div className="mt-4 space-y-0">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-5 w-5 items-center justify-center">
                {s.icon}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>
            <div className={i < steps.length - 1 ? "pb-5" : ""}>
              <p className="text-[12.5px] font-medium text-foreground">
                {s.title}
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted-2">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
        <div>
          <p className="text-[11px] text-muted-2">Mediation confidence</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            86%
          </p>
        </div>
        <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted">
          Explainable
        </span>
      </div>
    </div>
  );
}
