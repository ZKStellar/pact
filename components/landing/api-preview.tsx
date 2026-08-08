import { CodeBlock } from "@/components/app/code-block";

const snippet = `import { Pact } from "@pact/sdk";

const pact = new Pact({
  apiKey: process.env.PACT_API_KEY,
  environment: "mainnet",
});

// Create a milestone agreement with an audited escrow
const agreement = await pact.agreements.create({
  title: "Brand Website Redesign",
  description: "Design system, templates, and CMS migration.",
  parties: [
    { address: "7xKXtg2C…", role: "client" },
    { address: "G9vQZ1mR…", role: "provider" },
  ],
  milestones: [
    { title: "Discovery", amount: 12_000 },
    { title: "Build", amount: 16_000 },
    { title: "Launch", amount: 8_000 },
  ],
  currency: "USDC",
});

// Submit a GitHub PR as evidence for a milestone
await pact.milestones.submitEvidence(agreement.id, "mil_3f…", {
  type: "github_pr",
  url: "https://github.com/acme/app/pull/312",
});

// Listen for dispute decisions in real time
pact.webhooks.on("dispute.decided", async (event) => {
  console.log(event.decision); // { action, amount, rationale }
});`;

export function ApiPreview() {
  return (
    <section className="border-t border-border bg-[#0b0b0b] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-[13px] font-medium uppercase tracking-wider text-muted-2">
              Developer API
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Assurance, as code.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              A typed SDK and REST API for every stage of the agreement
              lifecycle. Create agreements, fund escrows, submit evidence, and
              react to dispute decisions; no smart-contract expertise
              required.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm">
              <code className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[12px] text-foreground">
                npm install @pact/sdk
              </code>
              <span className="text-muted-2">or</span>
              <code className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[12px] text-foreground">
                curl api.pact.sh
              </code>
            </div>
          </div>

          <CodeBlock
            code={snippet}
            language="typescript"
            className="shadow-2xl shadow-black/40"
          />
        </div>
      </div>
    </section>
  );
}
