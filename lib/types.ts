export type AgreementStatus =
  | "draft"
  | "funding"
  | "active"
  | "disputed"
  | "completed"
  | "cancelled"
  | "expired";

export type PartyRole = "client" | "provider" | "escrow";

export interface Party {
  id: string;
  name: string;
  role: PartyRole;
  wallet: string;
  email: string;
  avatarColor: string;
  verified: boolean;
}

export type MilestoneStatus =
  | "pending"
  | "active"
  | "submitted"
  | "reviewing"
  | "approved"
  | "disputed"
  | "rejected";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: string;
  completedAt?: string;
  evidenceRequired: boolean;
}

export type EvidenceType =
  | "github_repo"
  | "github_pr"
  | "website"
  | "pdf"
  | "zip"
  | "image"
  | "video"
  | "document";

export type EvidenceStatus = "pending" | "verified" | "rejected" | "under_review";

export interface Evidence {
  id: string;
  agreementId: string;
  milestoneId: string;
  type: EvidenceType;
  title: string;
  filename?: string;
  size: string;
  version: number;
  hash: string;
  submittedBy: string;
  submittedAt: string;
  status: EvidenceStatus;
  description?: string;
  url?: string;
  verifiedAt?: string;
  verifier?: string;
}

export type AgreementRole = "client" | "provider";

export interface Agreement {
  id: string;
  code: string;
  title: string;
  description: string;
  status: AgreementStatus;
  parties: Party[];
  totalAmount: number;
  fundedAmount: number;
  currency: "USDC";
  createdAt: string;
  updatedAt: string;
  startsAt: string;
  endsAt: string;
  milestones: Milestone[];
  role: AgreementRole;
  chain: "stellar-mainnet" | "stellar-testnet";
  escrowAddress: string;
  featured?: boolean;
  tags: string[];
}

export type MediationStatus = "open" | "in_review" | "decided" | "escalated";

export interface MediationMessage {
  id: string;
  author: string;
  partyRole: "client" | "provider" | "mediator" | "system";
  text: string;
  at: string;
  evidenceIds?: string[];
}

export interface MediationEvent {
  id: string;
  type: "dispute_opened" | "evidence_submitted" | "question_asked" | "response" | "ai_reasoning" | "decision" | "escalation";
  title: string;
  description: string;
  at: string;
}

export interface Mediation {
  id: string;
  agreementId: string;
  agreementCode: string;
  agreementTitle: string;
  title: string;
  status: MediationStatus;
  openedAt: string;
  disputedAmount: number;
  disputedBy: "client" | "provider";
  summary: string;
  confidence: number;
  recommendation?: "release_funds" | "reject_claim" | "partial_release" | "escalate";
  recommendationNote?: string;
  decision?: {
    action: "release_funds" | "reject_claim" | "partial_release";
    amount: number;
    rationale: string;
    decidedAt: string;
  };
  messages: MediationMessage[];
  events: MediationEvent[];
  questions: {
    id: string;
    to: "client" | "provider" | "both";
    question: string;
    askedAt: string;
    response?: string;
    respondedAt?: string;
    answerer?: "client" | "provider";
  }[];
  aiReasoning: {
    findings: string[];
    weightings: { label: string; score: number }[];
    references: string[];
  };
  submittedEvidence: {
    id: string;
    evidenceId: string;
    title: string;
    type: EvidenceType;
    submittedBy: "client" | "provider";
    submittedAt: string;
    relevance: number;
  }[];
  timeline: {
    date: string;
    label: string;
    detail: string;
  }[];
}

export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionType =
  | "deposit"
  | "withdraw"
  | "lock"
  | "release"
  | "refund"
  | "fee";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  at: string;
  agreementId?: string;
  agreementCode?: string;
  txHash: string;
  from: string;
  to: string;
}

export interface Notification {
  id: string;
  type: "agreement" | "mediation" | "evidence" | "wallet" | "system";
  title: string;
  description: string;
  at: string;
  read: boolean;
  actionHref?: string;
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth: "API Key" | "Public" | "JWT";
  example: string;
  code: string;
}

export interface WalletSummary {
  available: number;
  locked: number;
  totalLocked: number;
  released: number;
  pending: number;
  address: string;
  network: "stellar-mainnet";
  reserved: number;
}
