export interface MetricPoint {
  label: string;
  value: number;
}

export interface SeriesPoint {
  date: string;
  agreements: number;
  fundsLocked: number;
  disputes: number;
  resolved: number;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export const analytics = {
  metrics: [
    { label: "Total agreements", value: 142, delta: 12.4 },
    { label: "Funds locked (all-time)", value: 1284200, delta: 8.9 },
    { label: "Success rate", value: 94.2, delta: 1.1 },
    { label: "Median settlement", value: 12, delta: -3.4, unit: "days" },
    { label: "Avg resolution time", value: 3.8, delta: -11.2, unit: "days" },
    { label: "Evidence submitted", value: 418, delta: 18.6 },
  ] as {
    label: string;
    value: number;
    delta: number;
    unit?: string;
  }[],

  monthlyVolume: [
    { date: "Feb", agreements: 14, fundsLocked: 82000, disputes: 2, resolved: 1 },
    { date: "Mar", agreements: 17, fundsLocked: 94000, disputes: 3, resolved: 2 },
    { date: "Apr", agreements: 19, fundsLocked: 101000, disputes: 1, resolved: 2 },
    { date: "May", agreements: 22, fundsLocked: 118000, disputes: 4, resolved: 3 },
    { date: "Jun", agreements: 24, fundsLocked: 132000, disputes: 2, resolved: 3 },
    { date: "Jul", agreements: 27, fundsLocked: 145000, disputes: 3, resolved: 3 },
    { date: "Aug", agreements: 19, fundsLocked: 98000, disputes: 2, resolved: 4 },
  ] as SeriesPoint[],

  statusDistribution: [
    { name: "Active", value: 46 },
    { name: "Completed", value: 58 },
    { name: "Disputed", value: 6 },
    { name: "Funding", value: 12 },
    { name: "Draft", value: 9 },
    { name: "Expired", value: 6 },
    { name: "Cancelled", value: 5 },
  ] as DistributionItem[],

  settlementTimes: [
    { name: "0–7 days", value: 31 },
    { name: "8–14 days", value: 24 },
    { name: "15–30 days", value: 21 },
    { name: "31–60 days", value: 16 },
    { name: "60+ days", value: 8 },
  ] as DistributionItem[],

  evidenceTypes: [
    { name: "GitHub PR", value: 112 },
    { name: "GitHub Repo", value: 84 },
    { name: "Documents", value: 76 },
    { name: "PDF", value: 58 },
    { name: "Images", value: 44 },
    { name: "Video", value: 26 },
    { name: "Website", value: 18 },
  ] as DistributionItem[],

  topAgreements: [
    { code: "PACT-2026-0117", title: "Mobile App Development", amount: 86000, status: "disputed" },
    { code: "PACT-2026-0086", title: "E-commerce Platform Build", amount: 74000, status: "active" },
    { code: "PACT-2026-0130", title: "Solana Program Security Review", amount: 68000, status: "active" },
    { code: "PACT-2026-0098", title: "DevOps & CI/CD Migration", amount: 62000, status: "active" },
    { code: "PACT-2026-0061", title: "Data Pipeline & Analytics Build", amount: 54000, status: "disputed" },
  ],
};
