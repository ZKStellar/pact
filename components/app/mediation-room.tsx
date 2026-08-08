"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileStack,
  Gavel,
  Info,
  MessageSquare,
  Scale,
  Send,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import type { Mediation, MediationMessage } from "@/lib/types";
import { formatUsd, formatDateTime, initials, cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { MediationStatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const typeLabels: Record<string, string> = {
  github_repo: "GitHub Repo",
  github_pr: "GitHub PR",
  website: "Website",
  pdf: "PDF",
  zip: "ZIP",
  image: "Image",
  video: "Video",
  document: "Document",
};

const recommendationLabels: Record<string, string> = {
  release_funds: "Release funds",
  reject_claim: "Reject claim",
  partial_release: "Partial release",
  escalate: "Escalate to human",
};

export function MediationRoom({ mediation }: { mediation: Mediation }) {
  const [messages, setMessages] = useState<MediationMessage[]>(mediation.messages);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        author: "You",
        partyRole: mediation.disputedBy === "client" ? "client" : "provider",
        text,
        at: new Date().toISOString(),
      },
    ]);
    setDraft("");
    setThinking(true);
    await new Promise((r) => setTimeout(r, 2600));
    setThinking(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        author: "Pact Mediator",
        partyRole: "mediator",
        text: "Noted. I'm folding this into the evidence weighting against the acceptance criteria and will update the recommendation. You'll see the reasoning update in the right panel shortly.",
        at: new Date().toISOString(),
      },
    ]);
  };

  const decided = mediation.status === "decided";

  return (
    <div className="space-y-6">
      <PageHeader
        title={mediation.title}
        description={`${mediation.agreementCode} · ${mediation.agreementTitle}`}
      >
        <MediationStatusBadge status={mediation.status} />
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> AI-assisted review
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[280px_1fr_340px]">
        {/* Left: case context */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <Gavel className="h-4 w-4 text-muted-2" /> Case context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[13px]">
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted">Disputed amount</span>
                <span className="font-mono text-foreground">{formatUsd(mediation.disputedAmount)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted">Opened</span>
                <span className="text-right text-foreground">{formatDateTime(mediation.openedAt)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted">Disputed by</span>
                <span className="text-foreground">
                  {mediation.disputedBy === "client" ? "Client" : "Provider"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted">Recommendation</span>
                <span className="text-right font-medium text-foreground">
                  {mediation.recommendation
                    ? recommendationLabels[mediation.recommendation]
                    : "Pending"}
                </span>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-muted">Confidence</span>
                  <span className="font-mono text-foreground">
                    {Math.round(mediation.confidence * 100)}%
                  </span>
                </div>
                <Progress value={Math.round(mediation.confidence * 100)} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px]">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ol className="space-y-0">
                {mediation.timeline.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          i === 0 ? "bg-warning" : "bg-foreground/40"
                        )}
                      />
                      {i < mediation.timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className={cn("flex-1", i < mediation.timeline.length - 1 && "pb-4")}>
                      <p className="text-[12px] font-medium text-foreground">{t.label}</p>
                      <p className="text-[11px] text-muted-2">{t.detail}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-2">
                        {formatDateTime(t.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Center: conversation */}
        <Card>
          <CardContent className="flex h-[calc(100vh-16rem)] flex-col p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-[13px] font-medium text-foreground">Mediation conversation</p>
              <Badge variant="muted" className="gap-1">
                <MessageSquare className="h-3 w-3" /> {messages.length} messages
              </Badge>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} myRole={mediation.disputedBy} />
              ))}

              {mediation.questions.map((q) => (
                <QuestionCard key={q.id} mediation={mediation} q={q} />
              ))}

              {thinking && (
                <div className="flex items-center gap-3 text-[12px] text-muted">
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground [animation-delay:300ms]" />
                    <span className="ml-1">Mediator is reasoning…</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Ask the mediator a question, or add a note for the other party…"
                  className="min-h-[60px] resize-none bg-surface-2"
                />
                <Button onClick={sendMessage} disabled={!draft.trim() || thinking} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-2">
                Messages are part of the mediation record and influence the final decision.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: evidence & AI reasoning */}
        <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          {mediation.recommendation && !decided && (
            <Card className="border-warning/25">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <Scale className="h-4 w-4 text-warning" /> Current recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-warning/30 text-warning">
                    {recommendationLabels[mediation.recommendation]}
                  </Badge>
                  <span className="font-mono text-[12px] text-muted">
                    {Math.round(mediation.confidence * 100)}% confidence
                  </span>
                </div>
                {mediation.recommendationNote && (
                  <p className="text-[13px] leading-relaxed text-muted">
                    {mediation.recommendationNote}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {decided && mediation.decision && (
            <Card className="border-success/25">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between rounded-md border border-success/25 bg-success/5 px-3 py-2">
                  <span className="font-medium text-success">
                    {recommendationLabels[mediation.decision.action]}
                  </span>
                  <span className="font-mono text-foreground">{formatUsd(mediation.decision.amount)}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-muted">{mediation.decision.rationale}</p>
                <p className="text-[11px] text-muted-2">
                  Decided {formatDateTime(mediation.decision.decidedAt)}
                </p>
                <Button variant="success" className="w-full" onClick={() => toast.success("Decision executed", { description: "Funds released from escrow per the decision." })}>
                  <Wallet className="h-4 w-4" /> Execute decision
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <Sparkles className="h-4 w-4 text-foreground" /> AI reasoning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-2">
                  Findings
                </p>
                <ul className="space-y-2">
                  {mediation.aiReasoning.findings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-2">
                  Evidence weighting
                </p>
                <div className="space-y-2.5">
                  {mediation.aiReasoning.weightings.map((w) => (
                    <div key={w.label}>
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="text-muted">{w.label}</span>
                        <span className="font-mono text-foreground">{w.score}</span>
                      </div>
                      <Progress value={w.score} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-2">
                  References
                </p>
                <ul className="space-y-1.5">
                  {mediation.aiReasoning.references.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-muted">
                      <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-2" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <FileStack className="h-4 w-4 text-muted-2" /> Submitted evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mediation.submittedEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-md border border-border bg-surface-2 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-medium text-foreground">{ev.title}</p>
                    <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                      {typeLabels[ev.type]}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-2">
                    <span className="capitalize">by {ev.submittedBy}</span>
                    <span className="font-mono">{Math.round(ev.relevance * 100)}% relevant</span>
                  </div>
                </div>
              ))}
              <ShareEvidenceButton mediation={mediation} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  myRole,
}: {
  message: MediationMessage;
  myRole: "client" | "provider";
}) {
  const isMediator = message.partyRole === "mediator";
  const isSystem = message.partyRole === "system";
  const mine = message.partyRole === myRole;
  const alignRight = mine || isSystem;

  return (
    <div className={cn("flex gap-3", alignRight && "justify-end")}>
      {!alignRight && (
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className={cn(
              "text-[10px]",
              isMediator ? "bg-foreground text-black" : "bg-surface-2 text-foreground"
            )}
          >
            {isMediator ? <Scale className="h-3.5 w-3.5" /> : initials(message.author)}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg border px-3.5 py-2.5",
          mine ? "border-border bg-foreground" : "border-border bg-surface-2"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-[12px] font-medium", mine ? "text-black" : "text-foreground")}>
            {message.author}
          </span>
          <span className="text-[10px] text-muted-2">{formatDateTime(message.at)}</span>
          {message.partyRole !== "mediator" && message.partyRole !== "system" && (
            <Badge variant="outline" className="px-1.5 py-0 text-[9px] capitalize">
              {message.partyRole}
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "mt-1 text-[13px] leading-relaxed",
            mine ? "text-black" : "text-muted"
          )}
        >
          {message.text}
        </p>
        {message.evidenceIds && message.evidenceIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.evidenceIds.map((id) => (
              <button
                key={id}
                onClick={() => toast.info("Evidence linked", { description: id })}
                className="flex items-center gap-1 rounded bg-foreground/10 px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:bg-foreground/15"
              >
                <FileStack className="h-3 w-3" /> {id}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  mediation,
  q,
}: {
  mediation: Mediation;
  q: Mediation["questions"][number];
}) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [responded, setResponded] = useState<typeof q>(q);

  const submit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setResponded({
      ...q,
      response: answer.trim(),
      respondedAt: new Date().toISOString(),
      answerer: mediation.disputedBy === "client" ? "client" : "provider",
    });
    toast.success("Response submitted", { description: "The mediator will factor this in." });
  };

  if (responded.response) {
    return (
      <div className="rounded-lg border border-border bg-surface-2/60 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-3 w-3 text-warning" />
          </div>
          <p className="text-[12px] font-medium text-foreground">Question · to {responded.to}</p>
          <span className="ml-auto text-[10px] text-muted-2">{formatDateTime(responded.askedAt)}</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{responded.question}</p>
        <div className="mt-3 rounded-md border border-success/20 bg-success/5 px-3 py-2.5">
          <p className="text-[11px] font-medium text-success">
            Answered by {responded.answerer}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-foreground">{responded.response}</p>
          <p className="mt-1 text-[10px] text-muted-2">{formatDateTime(responded.respondedAt!)}</p>
        </div>
      </div>
    );
  }

  const isForMe =
    q.to === "both" ||
    (q.to === "client" && mediation.disputedBy === "client") ||
    (q.to === "provider" && mediation.disputedBy === "provider");

  return (
    <div className="rounded-lg border border-warning/25 bg-warning/[0.04] p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
          <Clock className="h-3 w-3 text-warning" />
        </div>
        <p className="text-[12px] font-medium text-foreground">Question · to {q.to}</p>
        <span className="ml-auto text-[10px] text-muted-2">{formatDateTime(q.askedAt)}</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{q.question}</p>
      {isForMe ? (
        <div className="mt-3 space-y-2">
          <Textarea
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your response…"
            className="bg-surface"
          />
          <Button size="sm" onClick={submit} disabled={!answer.trim() || submitting}>
            {submitting ? "Submitting…" : "Submit response"}
          </Button>
        </div>
      ) : (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-2">
          <UserRound className="h-3 w-3" /> Awaiting the {q.to === "client" ? "client's" : "provider's"} response
        </p>
      )}
    </div>
  );
}

function ShareEvidenceButton({ mediation }: { mediation: Mediation }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(mediation.submittedEvidence[0]?.evidenceId ?? "");
  const [note, setNote] = useState("");
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    setSharing(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSharing(false);
    setOpen(false);
    setNote("");
    toast.success("Evidence shared", { description: "Added to the mediation record and weighting." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <FileStack className="h-4 w-4" /> Share evidence
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share evidence</DialogTitle>
          <DialogDescription>
            Submit an existing evidence item to this mediation. It will be added to the AI
            weighting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Evidence</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mediation.submittedEvidence.map((ev) => (
                  <SelectItem key={ev.id} value={ev.evidenceId}>
                    {ev.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note for the mediator</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why is this relevant to the disputed milestone?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={share} disabled={sharing}>
            {sharing ? "Sharing…" : "Share evidence"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
