const steps = [
  {
    number: "01",
    title: "Define the agreement",
    description:
      "Name the parties, set the scope, split the value into milestones, and agree on the evidence each milestone requires.",
  },
  {
    number: "02",
    title: "Fund the escrow",
    description:
      "The client funds the agreement in USDC. Funds are locked in the Pact escrow program and visible to every party.",
  },
  {
    number: "03",
    title: "Deliver & submit evidence",
    description:
      "The provider delivers and submits verifiable evidence per milestone — a PR, a file, a live site. Every submission is timestamped.",
  },
  {
    number: "04",
    title: "Verify or mediate",
    description:
      "The client verifies evidence against the acceptance criteria. If they can't agree, the AI mediator reviews and issues a decision.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border bg-[#0b0b0b] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-wider text-muted-2">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From handshake to settlement, on rails.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            A four-step lifecycle that replaces spreadsheets, trust issues, and
            weeks of back-and-forth.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {step.number}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-5 text-[15px] font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
