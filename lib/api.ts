import { agreements, getAgreement } from "@/lib/data/agreements";
import { mediations, getMediation, getMediationForAgreement } from "@/lib/data/mediations";
import { evidence, getEvidenceForAgreement } from "@/lib/data/evidence";
import { transactions, walletSummary, notifications } from "@/lib/data/transactions";
import { analytics } from "@/lib/data/analytics";
import { apiDocs } from "@/lib/data/api-docs";
import { currentUser, organization } from "@/lib/data/organization";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mock<T>(data: T, ms = 500 + Math.random() * 450): () => Promise<T> {
  return async () => {
    await delay(ms);
    return data;
  };
}

export const api = {
  agreements: {
    list: mock(agreements),
    get: (id: string) => mock(getAgreement(id), 400)(),
  },
  mediations: {
    list: mock(mediations),
    get: (id: string) => mock(getMediation(id), 400)(),
    forAgreement: (agreementId: string) =>
      mock(getMediationForAgreement(agreementId), 300)(),
  },
  evidence: {
    list: mock(evidence),
    forAgreement: (agreementId: string) =>
      mock(getEvidenceForAgreement(agreementId), 350)(),
  },
  wallet: {
    summary: mock(walletSummary),
    transactions: mock(transactions),
  },
  notifications: {
    list: mock(notifications),
  },
  analytics: {
    get: mock(analytics),
  },
  docs: {
    get: mock(apiDocs),
  },
  organization: {
    get: mock({ currentUser, organization }),
  },
};

export const queryKeys = {
  agreements: ["agreements"] as const,
  agreement: (id: string) => ["agreements", id] as const,
  mediations: ["mediations"] as const,
  mediation: (id: string) => ["mediations", id] as const,
  mediationForAgreement: (agreementId: string) =>
    ["mediations", "by-agreement", agreementId] as const,
  evidence: ["evidence"] as const,
  evidenceForAgreement: (agreementId: string) =>
    ["evidence", "by-agreement", agreementId] as const,
  walletSummary: ["wallet", "summary"] as const,
  walletTransactions: ["wallet", "transactions"] as const,
  notifications: ["notifications"] as const,
  analytics: ["analytics"] as const,
  docs: ["docs"] as const,
  organization: ["organization"] as const,
};
