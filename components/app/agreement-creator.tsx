"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FilePenLine, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { WriteAgreementForm } from "@/components/app/write-agreement-form";
import { UploadAgreementForm } from "@/components/app/upload-agreement-form";

type Source = "write" | "upload";

function Option({
  source,
  active,
  onSelect,
}: {
  source: Source;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = source === "write" ? FilePenLine : Upload;
  const title = source === "write" ? "Write terms" : "Upload a document";
  const description =
    source === "write"
      ? "Draft your agreement in a rich text editor. Best for lightweight contracts."
      : "Upload an existing PDF, DOCX, Markdown, or text agreement and extract its terms.";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "relative rounded-lg border p-5 text-left transition-colors",
        active
          ? "border-foreground/60 bg-surface"
          : "border-border bg-surface-2/50 hover:border-foreground/40 hover:bg-surface"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
            active ? "border-foreground/40 text-foreground" : "border-border text-muted"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">{title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      {active && (
        <CheckCircle2 className="absolute right-4 top-4 h-4 w-4 text-success" />
      )}
    </button>
  );
}

export function AgreementCreator() {
  const [source, setSource] = useState<Source>("write");

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/agreements"
        className="flex items-center gap-1 text-[12px] text-muted-2 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to agreements
      </Link>

      <div className="mb-6 mt-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Create an agreement</h1>
          <p className="text-[13px] text-muted">Choose how to start your agreement.</p>        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Option source="write" active={source === "write"} onSelect={() => setSource("write")} />
        <Option source="upload" active={source === "upload"} onSelect={() => setSource("upload")} />
      </div>

      <div className="mt-6">
        {source === "write" ? <WriteAgreementForm /> : <UploadAgreementForm />}
      </div>
    </div>
  );
}
