"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FilePenLine, CheckCircle2 } from "lucide-react";
import { RichTextEditor } from "@/components/app/rich-text-editor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WriteAgreementForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Give the agreement a title");
      return;
    }
    const text = content.replace(/<[^>]*>/g, "").trim();
    if (text.length < 40) {
      toast.error("Write out the terms", {
        description: "Add the scope, deliverables, and acceptance criteria before creating.",
      });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setCreatedCode(`agr_${Math.random().toString(36).slice(2, 8)}`);
    toast.success("Agreement drafted", {
      description: "Your written terms were saved as the agreement document.",
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
            <span className="font-mono text-foreground">{createdCode}</span> was created with
            your written terms. Invitations will be sent to both parties once you add them.
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
        <FilePenLine className="h-4 w-4 text-muted" />
        <h2 className="text-[15px] font-semibold text-foreground">Write the agreement terms</h2>
      </div>
      <Card>
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="write-title">Agreement title</Label>
            <Input
              id="write-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design system migration for Stellar Dashboard"
            />
          </div>
          <div className="space-y-2">
            <Label>Terms</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Describe the parties, scope, deliverables, payment terms, milestones, and acceptance criteria…"
            />
            <p className="text-[12px] text-muted-2">
              Format with the toolbar. Milestones can be added later from the agreement page.
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <Link
          href="/agreements"
          className="flex items-center gap-1 text-[12px] text-muted-2 transition-colors hover:text-foreground"
        >
          Cancel and go back
        </Link>
        <Button onClick={submit} disabled={submitting}>
          {submitting ? "Creating…" : "Create agreement"}
        </Button>
      </div>
    </div>
  );
}
