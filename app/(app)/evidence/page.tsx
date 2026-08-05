import type { Metadata } from "next";
import { Suspense } from "react";
import { EvidenceLibrary } from "@/components/app/evidence-library";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Evidence",
};

export default function EvidencePage() {
  return (
    <Suspense fallback={<EvidenceFallback />}>
      <EvidenceLibrary />
    </Suspense>
  );
}

function EvidenceFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-60" />
      </div>
      <div className="divide-y divide-border rounded-lg border border-border bg-surface">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
