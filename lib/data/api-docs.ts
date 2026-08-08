export const apiDocs = {
  baseUrl: "https://api.pact.sh",
  sdkInstall: "npm install @pact/sdk",
  sdkInit: `import { Pact } from "@pact/sdk";

const pact = new Pact({
  apiKey: process.env.PACT_API_KEY,
  environment: "mainnet",
});`,
  auth: `curl https://api.pact.sh/v1/agreements \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json"`,
  endpoints: [
    {
      method: "GET",
      path: "/v1/agreements",
      description: "List agreements with filters, pagination, and sorting. Supports cursor-based pagination for large result sets.",
      auth: "API Key",
      example: "List all agreements in a given status",
      code: `const agreements = await pact.agreements.list({
  status: "active",
  limit: 50,
  cursor: "c2VjcmV0LW1lZXRz",
});`,
    },
    {
      method: "POST",
      path: "/v1/agreements",
      description: "Create a milestone-based agreement and open the escrow. Requires both parties and at least one milestone.",
      auth: "API Key",
      example: "Create a two-party milestone agreement",
      code: `const agreement = await pact.agreements.create({
  title: "Brand Website Redesign",
  description: "Design system, templates, migration.",
  parties: [
    { address: "GQKG7O5C…", role: "client" },
    { address: "G9vQZ1mR…", role: "provider" },
  ],
  milestones: [
    { title: "Discovery", amount: 12000 },
    { title: "Build", amount: 16000 },
  ],
  currency: "USDC",
});`,
    },
    {
      method: "GET",
      path: "/v1/agreements/{id}",
      description: "Fetch a single agreement with its milestones, parties, escrow state, and funding progress.",
      auth: "API Key",
      example: "Fetch a single agreement",
      code: `const agreement = await pact.agreements.get("agr_8h2j…");`,
    },
    {
      method: "POST",
      path: "/v1/agreements/{id}/fund",
      description: "Fund an agreement to fully or partially back the escrow. Accepts USDC transfers from the funding wallet.",
      auth: "API Key",
      example: "Fund an agreement escrow",
      code: `await pact.agreements.fund("agr_8h2j…", {
  amount: 28000,
  usdc: "7xKXtg2C…",
});`,
    },
    {
      method: "POST",
      path: "/v1/agreements/{id}/milestones/{milestoneId}/evidence",
      description: "Submit evidence against a milestone. Supports URLs, uploaded files, and GitHub objects.",
      auth: "API Key",
      example: "Submit a GitHub PR as evidence",
      code: `await pact.milestones.submitEvidence(
  "agr_8h2j…",
  "mil_3f…",
  {
    type: "github_pr",
    url: "https://github.com/acme/app/pull/312",
  }
);`,
    },
    {
      method: "POST",
      path: "/v1/agreements/{id}/milestones/{milestoneId}/approve",
      description: "Approve a milestone, releasing the escrowed amount to the provider minus protocol fees.",
      auth: "API Key",
      example: "Approve a milestone",
      code: `await pact.milestones.approve("agr_8h2j…", "mil_3f…");`,
    },
    {
      method: "POST",
      path: "/v1/agreements/{id}/disputes",
      description: "Open a dispute on a milestone. The Pact Mediator begins an evidence-driven review immediately.",
      auth: "API Key",
      example: "Open a dispute",
      code: `const dispute = await pact.disputes.open(
  "agr_8h2j…",
  { milestoneId: "mil_3f…" }
);`,
    },
    {
      method: "GET",
      path: "/v1/disputes/{id}",
      description: "Fetch the full mediation state: timeline, questions, evidence, AI reasoning, and any decision.",
      auth: "API Key",
      example: "Fetch mediation state",
      code: `const mediation = await pact.disputes.get("med_01…");`,
    },
    {
      method: "GET",
      path: "/v1/evidence",
      description: "Query evidence with filters for type, status, agreement, and submission window.",
      auth: "API Key",
      example: "Query verified evidence",
      code: `const evidence = await pact.evidence.list({
  status: "verified",
  agreementId: "agr_8h2j…",
});`,
    },
    {
      method: "POST",
      path: "/v1/webhooks",
      description: "Register a webhook to receive agreement, milestone, dispute, and wallet events in real time.",
      auth: "API Key",
      example: "Register a webhook",
      code: `await pact.webhooks.create({
  url: "https://app.acme.com/pact/webhooks",
  events: [
    "milestone.approved",
    "dispute.opened",
    "dispute.decided",
    "escrow.funded",
  ],
});`,
    },
  ] as {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    description: string;
    auth: string;
    example: string;
    code: string;
  }[],
};
