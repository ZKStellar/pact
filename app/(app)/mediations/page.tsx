import type { Metadata } from "next";
import { MediationList } from "@/components/app/mediation-list";

export const metadata: Metadata = {
  title: "AI Mediator",
};

export default function MediationsPage() {
  return <MediationList />;
}
