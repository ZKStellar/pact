import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAgreement } from "@/lib/data/agreements";
import { getMediationForAgreement } from "@/lib/data/mediations";
import { AgreementDetails } from "@/components/app/agreement-details";

export const metadata: Metadata = {
  title: "Agreement details",
};

export default async function AgreementPage(
  props: PageProps<"/agreements/[id]">
) {
  const { id } = await props.params;
  const agreement = getAgreement(id);
  if (!agreement) notFound();
  const mediation = getMediationForAgreement(id);

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/agreements">Agreements</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <span className="font-mono">{agreement.code}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AgreementDetails agreement={agreement} mediation={mediation} />

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
        <p className="text-muted">
          Something look wrong?{" "}
          <Link href="/settings" className="text-foreground underline-offset-4 hover:underline">
            Review agreement settings
          </Link>
        </p>
        <Link href="/agreements" className="text-muted transition-colors hover:text-foreground">
          Back to agreements
        </Link>
      </div>
    </div>
  );
}
