import type { Mediation } from "@/lib/types";

const iso = (offsetDays: number) =>
  new Date(Date.now() - offsetDays * 86400000).toISOString();

export const mediations: Mediation[] = [
  {
    id: "med_01",
    agreementId: "agr_beta",
    agreementCode: "PACT-2026-0117",
    agreementTitle: "Mobile App Development",
    title: "Sync Engine milestone disputed",
    status: "in_review",
    openedAt: iso(6),
    disputedAmount: 24000,
    disputedBy: "client",
    summary:
      "Quanta Digital submitted milestone 3 (Sync Engine & Scheduling) claiming completion. The client disputes delivery, reporting that background sync drops records under memory pressure and the conflict resolution merges the wrong revision on offline devices.",
    confidence: 0.86,
    recommendation: "partial_release",
    recommendationNote:
      "The evidence strongly supports partial completion. The sync engine works in normal conditions and passes the CI suite, but fails the memory-pressure test documented in the acceptance criteria. Recommend releasing 70% and holding 30% until the two blocking issues are resolved.",
    questions: [
      {
        id: "q_01",
        to: "provider",
        question:
          "Milestone acceptance criteria 3.4 specifies 'no data loss under background memory pressure (repeatable test: 500 records, 12MB heap limit)'. Your submission included logs from a device with an 8MB heap limit. Can you confirm which heap limit was used, and share the test run that demonstrates 3.4 passing?",
        askedAt: iso(5.5),
        response:
          "We ran the memory-pressure test on staging with the 12MB limit — the 8MB log was an earlier iteration. Attaching the full staging run in PR #312, including the heap profile and the 500-record sync log. The device-side logs in the app store build reflect production, where we did not hit the threshold.",
        respondedAt: iso(5),
        answerer: "provider",
      },
      {
        id: "q_02",
        to: "client",
        question:
          "The client-side crash reports show two unique sync-related errors (SYNC-4107, SYNC-4107B) on iOS 17.x. Can you confirm whether these reproduce on the exact staging build from PR #312, or only on the store build?",
        askedAt: iso(5),
        response:
          "We reproduced SYNC-4107 on the exact staging build from PR #312 at the 12MB heap limit — two records out of 500 were silently dropped. The device in the field was the same build. We filmed the repro and attached it, plus the full device log.",
        respondedAt: iso(4.6),
        answerer: "client",
      },
    ],
    messages: [
      {
        id: "m_01",
        author: "Pact Mediator",
        partyRole: "mediator",
        text: "Dispute opened. Both parties will be asked to submit evidence against the milestone acceptance criteria. The disputed milestone will remain locked in escrow.",
        at: iso(6),
      },
      {
        id: "m_02",
        author: "Maya Chen",
        partyRole: "provider",
        text: "We're confident the milestone is complete. Attaching the staging test run, PR #312, and the release checklist from the code review.",
        at: iso(5.5),
        evidenceIds: ["evd_beta_5"],
      },
      {
        id: "m_03",
        author: "Jordan Reyes",
        partyRole: "client",
        text: "The staging run looks cherry-picked. The reproduction video shows two records dropped at the documented heap limit. That's a failed acceptance criterion regardless of how the rest of the suite looks.",
        at: iso(5),
        evidenceIds: ["evd_beta_6", "evd_beta_4"],
      },
      {
        id: "m_04",
        author: "Pact Mediator",
        partyRole: "mediator",
        text: "I've asked both parties two clarifying questions. Quanta confirmed the staging configuration; the client provided a device reproduction. I'm now weighting evidence against the acceptance criteria and will issue a recommendation shortly.",
        at: iso(4.5),
      },
    ],
    events: [
      { id: "e_01", type: "dispute_opened", title: "Dispute opened", description: "Client disputes milestone 'Sync Engine & Scheduling'.", at: iso(6) },
      { id: "e_02", type: "evidence_submitted", title: "Provider submitted evidence", description: "PR #312, staging test run, release checklist.", at: iso(5.5) },
      { id: "e_03", type: "question_asked", title: "Question asked to provider", description: "Heap limit configuration for acceptance criterion 3.4.", at: iso(5.5) },
      { id: "e_04", type: "evidence_submitted", title: "Client submitted evidence", description: "Device reproduction video, SYNC-4107 logs.", at: iso(5) },
      { id: "e_05", type: "response", title: "Provider responded", description: "Confirmed staging config; pointed to PR #312 run.", at: iso(5) },
      { id: "e_06", type: "ai_reasoning", title: "AI reasoning in progress", description: "Weighting evidence against acceptance criteria.", at: iso(4.5) },
    ],
    aiReasoning: {
      findings: [
        "PR #312 passes the automated CI suite including the instrumented sync integration tests.",
        "Client reproduction video demonstrates SYNC-4107: 2 of 500 records dropped at the documented 12MB heap limit — a direct failure of acceptance criterion 3.4.",
        "The provider's staging run uses the same build; the heap profile confirms the limit was not honored during the run that passed.",
        "Conflict resolution logic passes the unit suite but was not exercised against a two-device offline merge under the documented constraint.",
        "Scheduling module is functionally complete and covered by tests; no counter-evidence was submitted.",
      ],
      weightings: [
        { label: "Acceptance criterion 3.4 (memory pressure)", score: 92 },
        { label: "Sync data integrity", score: 88 },
        { label: "Conflict resolution correctness", score: 71 },
        { label: "Scheduling module completeness", score: 84 },
        { label: "Test coverage & CI", score: 78 },
      ],
      references: [
        "Milestone 3 acceptance criteria, §3.4 (memory pressure)",
        "PR #312 — CI run sha 9f2c41d",
        "Client evidence evd_beta_6 — device reproduction video",
        "SYNC-4107 crash logs, build 2.4.1 (612)",
        "Sync engine design doc §5 (offline merge)",
      ],
    },
    submittedEvidence: [
      { id: "evd_beta_5", evidenceId: "evd_beta_5", title: "Staging test run + heap profile", type: "document", submittedBy: "provider", submittedAt: iso(5.5), relevance: 0.9 },
      { id: "evd_beta_7", evidenceId: "evd_beta_7", title: "PR #312 — sync engine", type: "github_pr", submittedBy: "provider", submittedAt: iso(5.5), relevance: 0.85 },
      { id: "evd_beta_4", evidenceId: "evd_beta_4", title: "Release checklist", type: "document", submittedBy: "provider", submittedAt: iso(5.5), relevance: 0.4 },
      { id: "evd_beta_6", evidenceId: "evd_beta_6", title: "SYNC-4107 reproduction video", type: "video", submittedBy: "client", submittedAt: iso(5), relevance: 0.95 },
      { id: "evd_beta_8", evidenceId: "evd_beta_8", title: "Device logs — build 2.4.1", type: "document", submittedBy: "client", submittedAt: iso(5), relevance: 0.8 },
    ],
    timeline: [
      { date: iso(6), label: "Dispute opened", detail: "Client disputes milestone 3 delivery." },
      { date: iso(5.5), label: "Provider evidence", detail: "5 items submitted." },
      { date: iso(5), label: "Client evidence", detail: "2 items submitted, including reproduction." },
      { date: iso(4.5), label: "Clarifying questions answered", detail: "2/2 answered." },
      { date: iso(1), label: "Recommendation drafted", detail: "Partial release (70%) recommended." },
    ],
  },
  {
    id: "med_02",
    agreementId: "agr_epsilon",
    agreementCode: "PACT-2026-0061",
    agreementTitle: "Data Pipeline & Analytics Build",
    title: "dbt models marts rejected",
    status: "open",
    openedAt: iso(2),
    disputedAmount: 16000,
    disputedBy: "provider",
    summary:
      "The client rejected milestone 2 (dbt Models & Marts), citing naming inconsistencies and three marts that do not match the agreed metric definitions. Quanta Digital disputes the rejection, arguing the models match the documented spec and the discrepancies are schema-drift artifacts from milestone 1.",
    confidence: 0.42,
    questions: [
      {
        id: "q2_01",
        to: "provider",
        question:
          "The agreed metric spec defines 'active_user' as any user with a recorded event in the last 28 days. Three marts use a 90-day window. Was the window changed after the spec was signed, and is that change documented anywhere?",
        askedAt: iso(1.6),
        response:
          "We followed the 90-day window from the schema registry, which we interpreted as the source of truth. We can provide the registry history to show it pre-dates the milestone.",
        respondedAt: iso(1.2),
        answerer: "provider",
      },
      {
        id: "q2_02",
        to: "client",
        question:
          "Your rejection notes that mart `mrt_revenue` returns rows for cancelled subscriptions. The spec you attached lists revenue as recognized on charge date with no cancellation filter. Can you confirm whether cancellations should be excluded, or whether the mart should return charge-date revenue with a separate cancellation column?",
        askedAt: iso(1.6),
      },
    ],
    messages: [
      {
        id: "m2_01",
        author: "Pact Mediator",
        partyRole: "mediator",
        text: "Dispute opened after the provider escalated the rejected milestone review. Gathering evidence on the agreed metric definitions and schema registry history.",
        at: iso(2),
      },
      {
        id: "m2_02",
        author: "Marcus Webb",
        partyRole: "provider",
        text: "The marts match the schema registry. The client's reviewers are applying a spec that was never signed off. Registry history is attached.",
        at: iso(1.5),
        evidenceIds: ["evd_eps_3"],
      },
      {
        id: "m2_03",
        author: "Jordan Reyes",
        partyRole: "client",
        text: "The registry history shows the 90-day window, but the milestone acceptance criteria we both signed list the 28-day definition verbatim. That's the agreement, not the registry.",
        at: iso(1.2),
        evidenceIds: ["evd_eps_4"],
      },
    ],
    events: [
      { id: "e2_01", type: "dispute_opened", title: "Dispute opened", description: "Provider escalates rejected milestone 2.", at: iso(2) },
      { id: "e2_02", type: "question_asked", title: "Questions asked", description: "Two clarifying questions sent to both parties.", at: iso(1.6) },
      { id: "e2_03", type: "response", title: "Provider responded", description: "Registry history submitted.", at: iso(1.2) },
      { id: "e2_04", type: "evidence_submitted", title: "Client evidence", description: "Signed acceptance criteria submitted.", at: iso(1.2) },
    ],
    aiReasoning: {
      findings: [
        "Evidence currently favors the client on the metric-window conflict: the signed acceptance criteria reference the 28-day definition, which supersedes the registry.",
        "The provider's registry history pre-dates the milestone and may reflect an earlier undocumented decision — awaiting registry commit messages.",
        "The revenue mart question is unresolved; the client has not yet answered.",
      ],
      weightings: [
        { label: "Signed acceptance criteria", score: 80 },
        { label: "Schema registry consistency", score: 55 },
        { label: "Documentation trail", score: 60 },
      ],
      references: [
        "Milestone 2 acceptance criteria — metric definitions",
        "Schema registry commit history (quanta/dbt-registry)",
        "Client rejection comment thread (PACT-2026-0061 #44)",
      ],
    },
    submittedEvidence: [
      { id: "evd_eps_3", evidenceId: "evd_eps_3", title: "Schema registry history", type: "document", submittedBy: "provider", submittedAt: iso(1.5), relevance: 0.7 },
      { id: "evd_eps_4", evidenceId: "evd_eps_4", title: "Signed acceptance criteria", type: "pdf", submittedBy: "client", submittedAt: iso(1.2), relevance: 0.9 },
    ],
    timeline: [
      { date: iso(2), label: "Dispute opened", detail: "Provider escalates milestone 2 rejection." },
      { date: iso(1.6), label: "Questions asked", detail: "Two questions sent." },
      { date: iso(1.2), label: "1 of 2 responses", detail: "Provider responded; client pending." },
    ],
  },
  {
    id: "med_03",
    agreementId: "agr_iota",
    agreementCode: "PACT-2026-0086",
    agreementTitle: "E-commerce Platform Build",
    title: "PDP & Cart delivery reviewed",
    status: "decided",
    openedAt: iso(21),
    disputedAmount: 22000,
    disputedBy: "client",
    summary:
      "The client disputed the PDP & Cart milestone claiming the cart drawer's promo code handling was incomplete. Northwind Studio demonstrated promo code support was explicitly out of scope in the agreed milestone spec. Funds were released in full.",
    confidence: 0.97,
    recommendation: "release_funds",
    decision: {
      action: "release_funds",
      amount: 22000,
      rationale:
        "The milestone spec, signed by both parties, explicitly defers promo codes to milestone 3. The submitted evidence — a working cart drawer with vaulting, line-item editing, and tested gift-card flow — satisfies every in-scope acceptance criterion. Dispute not supported by the agreement.",
      decidedAt: iso(18),
    },
    questions: [
      {
        id: "q3_01",
        to: "both",
        question:
          "Milestone 2 scope line 12 states promo code handling is deferred to milestone 3. Does either party dispute that this was in the signed spec at funding time?",
        askedAt: iso(20),
        response:
          "No dispute on scope — the concern is that the cart drawer exposes a promo code field that silently does nothing, which we felt was misleading even if out of scope.",
        respondedAt: iso(19.6),
        answerer: "client",
      },
    ],
    messages: [
      {
        id: "m3_01",
        author: "Pact Mediator",
        partyRole: "mediator",
        text: "Dispute opened. Reviewing milestone scope and cart drawer implementation.",
        at: iso(21),
      },
      {
        id: "m3_02",
        author: "Pact Mediator",
        partyRole: "mediator",
        text: "The signed milestone spec defers promo code handling to milestone 3. The exposed-but-inert field is a UX concern, not a deliverable failure. Recommendation: release funds in full.",
        at: iso(18),
      },
    ],
    events: [
      { id: "e3_01", type: "dispute_opened", title: "Dispute opened", description: "Client disputes PDP & Cart milestone.", at: iso(21) },
      { id: "e3_02", type: "question_asked", title: "Scope confirmation", description: "Both parties asked to confirm milestone scope.", at: iso(20) },
      { id: "e3_03", type: "decision", title: "Decision issued", description: "Funds released in full ($22,000).", at: iso(18) },
    ],
    aiReasoning: {
      findings: [
        "Milestone 2 scope line 12 explicitly defers promo code handling to milestone 3.",
        "All in-scope acceptance criteria pass against the staging storefront.",
        "The promo code field is present in the UI but inert; classified as UX, not a deliverable.",
      ],
      weightings: [
        { label: "Signed scope compliance", score: 97 },
        { label: "Functional completeness (in-scope)", score: 94 },
        { label: "Counter-evidence strength", score: 12 },
      ],
      references: [
        "Milestone 2 signed scope — line 12",
        "Staging storefront — cart drawer QA pass",
        "Milestone 3 scope — promo code handling",
      ],
    },
    submittedEvidence: [
      { id: "evd_iota_2", evidenceId: "evd_iota_2", title: "Staging storefront QA pass", type: "document", submittedBy: "provider", submittedAt: iso(20), relevance: 0.9 },
      { id: "evd_iota_3", evidenceId: "evd_iota_3", title: "Signed milestone scope", type: "pdf", submittedBy: "provider", submittedAt: iso(20), relevance: 0.95 },
    ],
    timeline: [
      { date: iso(21), label: "Dispute opened", detail: "Client disputes PDP & Cart milestone." },
      { date: iso(20), label: "Evidence gathered", detail: "2 items submitted." },
      { date: iso(18), label: "Decision", detail: "Release funds — $22,000." },
    ],
  },
];

export function getMediation(id: string): Mediation | undefined {
  return mediations.find((m) => m.id === id);
}

export function getMediationForAgreement(agreementId: string): Mediation | undefined {
  return mediations.find((m) => m.agreementId === agreementId);
}
