import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getMediation } from "@/lib/data/mediations";
import { MediationRoom } from "@/components/app/mediation-room";

export const metadata: Metadata = {
  title: "Mediation",
};

export default async function MediationPage(
  props: PageProps<"/mediations/[id]">
) {
  const { id } = await props.params;
  const mediation = getMediation(id);
  if (!mediation) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/mediations">AI Mediator</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{mediation.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <MediationRoom mediation={mediation} />
    </div>
  );
}
