"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, CheckCircle2, FileText, Loader2, Upload, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ACCEPTED = /\.(pdf|docx?|md|txt)$/i;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadAgreementForm() {
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!ACCEPTED.test(f.name)) {
      toast.error("Unsupported file", {
        description: "Upload a PDF, DOCX, Markdown, or plain text agreement.",
      });
      return;
    }
    setFile({ name: f.name, size: f.size });
  };

  const submit = async () => {
    if (!file) {
      toast.error("Attach an agreement document first");
      return;
    }
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setUploading(false);
    setCreatedCode(`agr_${Math.random().toString(36).slice(2, 8)}`);
    toast.success("Agreement drafted", {
      description: "Terms were extracted from your document.",
    });
  };

  if (createdCode) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-success/30 bg-success/10">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-foreground">Agreement drafted</h2>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            <span className="font-mono text-foreground">{createdCode}</span> was created from{" "}
            <span className="text-foreground">{file?.name}</span>. Review the extracted terms
            before inviting parties.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/agreements">View agreements</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-muted" />
        <h2 className="text-[15px] font-semibold text-foreground">Upload an agreement</h2>
      </div>
      <Card>
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center transition-colors",
              dragging
                ? "border-foreground bg-surface"
                : "border-border bg-surface-2/50 hover:border-foreground/40"
            )}
          >
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                  <FileText className="h-5 w-5 text-info" />
                  <div className="text-left">
                    <p className="max-w-[300px] truncate text-[13px] font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted-2">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-muted-2 transition-colors hover:text-danger"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-[12px] text-muted-2 underline-offset-4 hover:text-foreground hover:underline"
                >
                  Replace file
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="h-9 w-9 text-muted-2" />
                <p className="mt-3 text-[13px] font-medium text-foreground">
                  Drag & drop your agreement, or click to browse
                </p>
                <p className="mt-1 text-[11px] text-muted-2">
                  PDF, DOCX, Markdown, or plain text
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.md,.txt"
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>

          <div className="flex items-center gap-3 rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-[12px] text-muted">
            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            <p>
              The document is stored as the agreement terms. Parties, funding, and milestones
              can be added afterward from the agreement page.
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <Link
          href="/agreements"
          className="text-[12px] text-muted-2 transition-colors hover:text-foreground"
        >
          Cancel and go back
        </Link>
        <Button onClick={submit} disabled={uploading || !file}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Extracting terms…
            </>
          ) : (
            "Create agreement"
          )}
        </Button>
      </div>
    </div>
  );
}
