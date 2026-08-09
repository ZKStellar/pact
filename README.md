# Pact

**Programmable agreement infrastructure on Stellar.**

Pact turns agreements into executable systems. Two parties agree to a contract, fund it with USDC, and the value sits in on-chain escrow until the terms are met. Milestones release payments, evidence is anchored on-chain, and an impartial AI mediator resolves disputes without lawyers or courts.

Every agreement deserves assurance.

## What Pact does

Traditional contracts are static PDFs. You sign, then you are stuck enforcing them through a lawyer or a court. Pact makes the agreement a living, executable asset:

- **Program escrow.** Agreement value is locked in a program-verified escrow on Stellar. Neither party can move funds without following the terms both agreed to.
- **Milestone-driven payments.** Break any agreement into milestones with amounts, deadlines, and acceptance criteria. Funds release only when evidence meets the criteria.
- **Verifiable evidence.** Submit GitHub PRs, repositories, websites, files, and media. Every submission is content-hashed, versioned, and committed to the ledger.
- **Impartial AI mediation.** When a dispute opens, the mediator begins reviewing immediately, weighing evidence against your criteria and explaining every step.
- **Both-party amendments.** Terms can change after funding, but only with explicit approval from both parties.
- **Programmable by design.** Create, fund, and settle agreements through a typed SDK and REST API, or embed assurance into your own product.

## Architecture

Pact is three layers:

| Layer | What lives there |
| --- | --- |
| **Developer layer** | REST API, TypeScript SDK, webhooks, dashboard |
| **Protocol layer** | Agreement program, escrow & milestones, evidence registry, AI mediator |
| **Settlement layer** | Stellar mainnet, USDC, program-derived escrow, on-chain records |

Escrow is a program, not a wallet. Funds are controlled by the Pact program's logic, not by any individual. Releasing value requires a valid path through the agreement state machine, and every funding, release, review, and decision is recorded in an immutable activity feed.

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript, Turbopack)
- **Styling:** Tailwind CSS v4, shadcn/ui-style Radix primitives
- **Data:** TanStack Query over a mock API layer (`lib/api.ts`), React Hook Form + Zod
- **Visuals:** Framer Motion, recharts, Lucide icons, sonner toasts
- **Chain:** Stellar (mainnet / testnet), Circle USDC settlement

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app is fully navigable with seeded mock data, so every flow works end to end: drafting an agreement (rich text editor or document upload), funding escrow, milestone release, amendments, mediation, and the evidence library.

### Scripts

```bash
npm run dev        # start the development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (zero warnings is the bar)
npx tsc --noEmit   # TypeScript check
```

## Project structure

```
app/
  (landing)/          marketing site: hero, features, architecture, security, FAQ
  (auth)/             login, signup, magic link, forgot password
  (app)/              product shell
    dashboard/        overview with escrow health and activity
    agreements/       list, detail (amendments, evidence, mediation), new
    mediations/       mediation list and dispute room
    evidence/         evidence library with drag-and-drop uploads
    wallet/           balance, transactions, network
    analytics/        volume and payout charts
    docs/             API reference
    settings/         organization and security settings
components/
  app/                product components (agreement creator, mediation room, ...)
  landing/            marketing sections
  layout/             app shell, sidebar, topbar, command menu
  ui/                 Radix-based primitives
lib/
  api.ts              mock API layer with simulated latency
  types.ts            domain types (Agreement, Milestone, Amendment, Evidence)
  data/               seeded mock data (agreements, mediations, evidence, ...)
```

## Status and roadmap

Current status is honest by design:

- **Shipped:** complete frontend with all product flows, running against realistic mock data.
- **Network:** migrated to Stellar (USDC rails) after an initial Solana design. No mainnet funds are held.
- **Audit:** an independent audit is underway ahead of mainnet launch, alongside continuous invariant fuzzing. No audited or verified claims are made until it completes.

Up next:

1. Soroban escrow contract (agreement lifecycle, milestone release, amendments, mediation rulings)
2. Wire the frontend from the mock API layer to the live contract on Stellar testnet
3. TypeScript SDK and REST API
4. Testnet beta after audit, then mainnet launch

## Contributing

Planned work spans smart contract development (Soroban/Rust), invariant fuzzing and testnet integration tests, a TypeScript SDK and CLI, wallet integration, and documentation. Bug-fix bounties will be triaged from audit and fuzzing findings.
