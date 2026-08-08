"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDollarSign,
  FileSignature,
  Landmark,
  Plus,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { cn, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const solanaAddress = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Enter a valid Solana address");

const milestoneSchema = z.object({
  title: z.string().min(3, "Milestone title is required"),
  description: z.string().min(10, "Add a short description"),
  amount: z.coerce.number().positive("Must be greater than 0"),
  dueDate: z.string().min(1, "Due date required"),
  evidenceRequired: z.boolean(),
});

const formSchema = z.object({
  title: z.string().min(3, "Give the agreement a title"),
  description: z.string().min(20, "Describe the scope in a few sentences"),
  chain: z.enum(["solana-mainnet", "solana-devnet"]),
  tags: z.array(z.string()).max(5, "Up to 5 tags"),
  client: z.object({
    name: z.string().min(1, "Client name required"),
    email: z.string().email("Enter a valid email"),
    wallet: solanaAddress,
  }),
  provider: z.object({
    name: z.string().min(1, "Provider name required"),
    email: z.string().email("Enter a valid email"),
    wallet: solanaAddress,
  }),
  totalAmount: z.coerce.number().min(1, "Set a total amount"),
  milestones: z.array(milestoneSchema).min(1, "Add at least one milestone"),
  evidence: z.object({
    acceptedTypes: z.array(z.string()).min(1, "Select at least one"),
    requiresVerifiedIssuer: z.boolean(),
    verificationWindow: z.coerce.number().min(1).max(90),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 0, label: "Basics", icon: FileSignature },
  { id: 1, label: "Participants", icon: Users },
  { id: 2, label: "Funding", icon: Wallet },
  { id: 3, label: "Milestones", icon: CircleDollarSign },
  { id: 4, label: "Evidence", icon: Landmark },
  { id: 5, label: "Review", icon: Check },
] as const;

const evidenceTypes = [
  "github_repo",
  "github_pr",
  "website",
  "pdf",
  "zip",
  "image",
  "video",
  "document",
];

const evidenceTypeLabels: Record<string, string> = {
  github_repo: "GitHub repository",
  github_pr: "GitHub pull request",
  website: "Website",
  pdf: "PDF document",
  zip: "ZIP archive",
  image: "Image",
  video: "Video",
  document: "Document",
};

const defaultValues: FormValues = {
  title: "",
  description: "",
  chain: "solana-mainnet",
  tags: [],
  client: { name: "", email: "", wallet: "" },
  provider: { name: "", email: "", wallet: "" },
  totalAmount: 1000,
  milestones: [
    {
      title: "",
      description: "",
      amount: 500,
      dueDate: "",
      evidenceRequired: true,
    },
  ],
  evidence: {
    acceptedTypes: ["github_repo", "github_pr", "website", "pdf"],
    requiresVerifiedIssuer: true,
    verificationWindow: 7,
  },
};

const stepFields: Record<number, (keyof FormValues)[]> = {
  0: ["title", "description", "chain", "tags"],
  1: ["client", "provider"],
  2: ["totalAmount"],
  3: ["milestones"],
  4: ["evidence"],
  5: [],
};

export function CreateAgreementForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    control,
    setValue,
    trigger,
  } = form;

  const milestones = useFieldArray({ control, name: "milestones" });
  const tags = useWatch({ control, name: "tags" }) ?? [];
  const totalAmount = useWatch({ control, name: "totalAmount" }) || 0;
  const chain = useWatch({ control, name: "chain" });
  const requiresVerifiedIssuer = useWatch({ control, name: "evidence.requiresVerifiedIssuer" });

  const validateStep = async (target: number) => {
    const fields = stepFields[target];
    const result = await trigger(fields as (keyof FormValues)[], { shouldFocus: true });
    return result;
  };

  const next = async () => {
    if (!(await validateStep(step))) {
      toast.error("Review the highlighted fields", {
        description: "A few required fields still need attention.",
      });
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (tags.length >= 5) {
      toast.error("Maximum 5 tags");
      return;
    }
    if (tags.includes(value)) return;
    setValue("tags", [...tags, value], { shouldValidate: true });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag), { shouldValidate: true });
  };

  const submit = async () => {
    if (!(await validateStep(4))) {
      setStep(4);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    const code = `agr_${Math.random().toString(36).slice(2, 8)}`;
    setCreatedCode(code);
    toast.success("Agreement drafted", {
      description: "Invitations sent to both parties. Once they accept, fund the escrow to activate.",
    });
  };

  if (createdCode) {
    return <SuccessScreen code={createdCode} total={totalAmount} chain={chain} />;
  }

  const milestoneTotal = milestones.fields.reduce(
    (sum, _, i) => sum + (Number(form.getValues(`milestones.${i}.amount`)) || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const current = i === step;
            return (
              <div key={s.id} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => {
                    if (i < step) setStep(i);
                  }}
                  className={cn(
                    "group flex items-center gap-2.5",
                    i > step && "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] transition-colors",
                      done && "border-success/40 bg-success/10 text-success",
                      current && "border-foreground/40 bg-foreground/5 text-foreground",
                      !done && !current && "border-border text-muted-2"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <span
                    className={cn(
                      "hidden text-[12px] font-medium sm:block",
                      current ? "text-foreground" : "text-muted-2"
                    )}
                  >
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      i < step ? "bg-success/40" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {step === 0 && <BasicsStep form={form} tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} />}
            {step === 1 && <ParticipantsStep form={form} />}
            {step === 2 && <FundingStep form={form} onAdjustMilestones={() => setStep(3)} />}
            {step === 3 && (
              <MilestonesStep
                form={form}
                fields={milestones.fields}
                append={milestones.append}
                remove={milestones.remove}
              />
            )}
            {step === 4 && <EvidenceStep form={form} />}
            {step === 5 && <ReviewStep form={form} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Creating…" : "Create agreement"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Summary sidebar */}
      <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="text-[13px] font-medium text-foreground">Agreement summary</p>
            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted">Total value</span>
                <span className="font-mono text-foreground">{formatUsd(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Milestones</span>
                <span className="font-mono text-foreground">{milestones.fields.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Milestone value</span>
                <span className="font-mono text-foreground">{formatUsd(milestoneTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Network</span>
                <span className="text-foreground">
                  {chain === "solana-mainnet" ? "Mainnet" : "Devnet"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Verified issuer</span>
                <span className="text-foreground">
                  {requiresVerifiedIssuer ? "Required" : "Optional"}
                </span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface-2 p-3 text-[12px] leading-relaxed text-muted">
              Funded after both parties accept. Funds are released per approved milestone by the
              Pact escrow program; no party can move them unilaterally.
            </div>
          </CardContent>
        </Card>
        <Link
          href="/agreements"
          className="flex items-center gap-1 text-[12px] text-muted-2 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Cancel and go back
        </Link>
      </div>
    </div>
  );
}

/* ---------- Steps ---------- */

function StepHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-[13px] text-muted">{description}</p>
    </div>
  );
}

function BasicsStep({
  form,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
}) {
  const { register, setValue, watch } = form;
  const errors = form.formState.errors;
  const tags = watch("tags");

  return (
    <div>
      <StepHeading
        title="Basics"
        description="Name the agreement and describe the work both parties are committing to."
      />
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Agreement title</Label>
          <Input id="title" placeholder="e.g. Design system migration for Stellar Dashboard" {...register("title")} />
          {errors.title && <FieldError message={errors.title.message} />}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Describe the deliverables, scope, and acceptance criteria for this engagement…"
            {...register("description")}
          />
          {errors.description && <FieldError message={errors.description.message} />}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Network</Label>
            <Select
              value={watch("chain")}
              onValueChange={(v) => setValue("chain", v as "solana-mainnet" | "solana-devnet", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solana-mainnet">Solana mainnet</SelectItem>
                <SelectItem value="solana-devnet">Solana devnet (test)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type and press Enter"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1 px-2 py-0.5 text-[11px]">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-muted-2 transition-colors hover:text-danger">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantsStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const { register } = form;
  const errors = form.formState.errors;

  const party = (key: "client" | "provider", label: string, hint: string) => (
    <div className="space-y-5 rounded-lg border border-border bg-surface-2/50 p-5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[12px] text-muted">{hint}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${key}.name`}>Name</Label>
        <Input id={`${key}.name`} placeholder={label} {...register(`${key}.name`)} />
        {errors[key]?.name && <FieldError message={errors[key]?.name?.message} />}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${key}.email`}>Email</Label>
        <Input id={`${key}.email`} type="email" placeholder={`${label.toLowerCase()}@company.com`} {...register(`${key}.email`)} />
        {errors[key]?.email && <FieldError message={errors[key]?.email?.message} />}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${key}.wallet`}>Solana wallet</Label>
        <Input
          id={`${key}.wallet`}
          className="font-mono text-[13px]"
          placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
          {...register(`${key}.wallet`)}
        />
        {errors[key]?.wallet && <FieldError message={errors[key]?.wallet?.message} />}
      </div>
    </div>
  );

  return (
    <div>
      <StepHeading
        title="Participants"
        description="Both parties sign the agreement. Wallets are used for identity, signing, and escrow payouts."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {party("client", "Client", "Funds the escrow and approves milestones.")}
        {party("provider", "Provider", "Delivers the work and submits evidence.")}
      </div>
    </div>
  );
}

function FundingStep({
  form,
  onAdjustMilestones,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  onAdjustMilestones: () => void;
}) {
  const { register, watch } = form;
  const errors = form.formState.errors;

  return (
    <div>
      <StepHeading
        title="Funding"
        description="Set the total contract value. Funds are locked on-chain when both parties accept."
      />
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total agreement value (USDC)</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-2">
              $
            </span>
            <Input
              id="totalAmount"
              type="number"
              min={1}
              step={100}
              className="pl-7 font-mono"
              placeholder="10000"
              {...register("totalAmount")}
            />
          </div>
          {errors.totalAmount && <FieldError message={errors.totalAmount.message} />}
        </div>
        <div className="rounded-md border border-border bg-surface-2 p-4 text-[12px] leading-relaxed text-muted">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Wallet className="h-3.5 w-3.5 text-success" /> How funding works
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>The full amount is locked into a Pact escrow vault on {watch("chain") === "solana-mainnet" ? "Solana mainnet" : "devnet"}.</li>
            <li>Funds are released only when a milestone is approved, or by mediation decision.</li>
            <li>Unspent balances are returned to the client if the agreement is cancelled.</li>
          </ul>
        </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2/50 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Milestone coverage</p>
              <p className="text-[12px] text-muted">
                {watch("milestones").length} milestone{watch("milestones").length === 1 ? "" : "s"} must sum to the total.
              </p>
            </div>
            <button
              className="text-[12px] font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => onAdjustMilestones()}
            >
              Adjust milestones
            </button>
          </div>
        </div>
      </div>
  );
}

function MilestonesStep({
  form,
  fields,
  append,
  remove,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  fields: { id: string }[];
  append: ReturnType<typeof useFieldArray<FormValues, "milestones">>["append"];
  remove: ReturnType<typeof useFieldArray<FormValues, "milestones">>["remove"];
}) {
  const { register, setValue, watch } = form;
  const errors = form.formState.errors;

  const add = () => {
    append({
      title: "",
      description: "",
      amount: 0,
      dueDate: "",
      evidenceRequired: true,
    });
  };

  return (
    <div>
      <StepHeading
        title="Milestones"
        description="Break the work into deliverables. Each approved milestone releases its portion from escrow."
      />
      <div className="space-y-4">
        {fields.map((field, i) => (
          <div key={field.id} className="rounded-lg border border-border bg-surface-2/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-[11px] font-semibold text-foreground">
                {i + 1}
              </span>
              {fields.length > 1 && (
                <button
                  onClick={() => {
                    remove(i);
                    toast.success("Milestone removed");
                  }}
                  className="flex items-center gap-1 text-[12px] text-muted-2 transition-colors hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Finalize design system" {...register(`milestones.${i}.title`)} />
                {errors.milestones?.[i]?.title && <FieldError message={errors.milestones[i].title.message} />}
              </div>
              <div className="space-y-2">
                <Label>Amount (USDC)</Label>
                <Input type="number" min={1} className="font-mono" placeholder="2500" {...register(`milestones.${i}.amount`)} />
                {errors.milestones?.[i]?.amount && <FieldError message={errors.milestones[i].amount.message} />}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input placeholder="What counts as done for this milestone?" {...register(`milestones.${i}.description`)} />
                {errors.milestones?.[i]?.description && <FieldError message={errors.milestones[i].description.message} />}
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" {...register(`milestones.${i}.dueDate`)} />
                {errors.milestones?.[i]?.dueDate && <FieldError message={errors.milestones[i].dueDate.message} />}
              </div>
              <div className="flex items-end justify-between gap-4 rounded-md border border-border bg-surface p-3">
                <div>
                  <p className="text-[13px] font-medium text-foreground">Require evidence</p>
                  <p className="text-[11px] text-muted">Gate release on verifiable proof</p>
                </div>
                <Switch
                  checked={watch(`milestones.${i}.evidenceRequired`)}
                  onCheckedChange={(v) => setValue(`milestones.${i}.evidenceRequired`, v)}
                />
              </div>
            </div>
          </div>
        ))}
        <Button variant="secondary" className="w-full border-dashed" onClick={add}>
          <Plus className="h-4 w-4" /> Add milestone
        </Button>
        {errors.milestones && typeof errors.milestones.message === "string" && (
          <FieldError message={errors.milestones.message} />
        )}
      </div>
    </div>
  );
}

function EvidenceStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const { setValue, watch, register } = form;
  const errors = form.formState.errors;
  const accepted = watch("evidence.acceptedTypes");

  const toggle = (type: string) => {
    const next = accepted.includes(type)
      ? accepted.filter((t) => t !== type)
      : [...accepted, type];
    setValue("evidence.acceptedTypes", next, { shouldValidate: true });
  };

  return (
    <div>
      <StepHeading
        title="Evidence"
        description="Define what counts as verifiable proof for this agreement. Submissions are hashed and timestamped."
      />
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Accepted evidence types</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {evidenceTypes.map((type) => {
              const on = accepted.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggle(type)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-[12px] transition-colors",
                    on
                      ? "border-success/40 bg-success/10 text-foreground"
                      : "border-border bg-surface-2 text-muted hover:border-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                      on ? "border-success bg-success" : "border-border"
                    )}
                  >
                    {on && <Check className="h-3 w-3 text-black" />}
                  </span>
                  {evidenceTypeLabels[type]}
                </button>
              );
            })}
          </div>
          {errors.evidence?.acceptedTypes && <FieldError message={errors.evidence.acceptedTypes.message} />}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2/50 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Require verified issuer</p>
              <p className="text-[12px] text-muted">
                Only accept evidence from issuers verified by Pact (GitHub orgs, domains, attestations).
              </p>
            </div>
            <Switch
              checked={watch("evidence.requiresVerifiedIssuer")}
              onCheckedChange={(v) => setValue("evidence.requiresVerifiedIssuer", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-6 rounded-lg border border-border bg-surface-2/50 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Review window</p>
              <p className="text-[12px] text-muted">Days the counterparty has to review before auto-release.</p>
            </div>
            <Input
              type="number"
              min={1}
              max={90}
              className="w-24 font-mono text-right"
              {...register("evidence.verificationWindow")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const { watch } = form;
  const v = watch();

  const row = (label: string, value: string) => (
    <div className="flex items-start justify-between gap-4 py-2 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );

  return (
    <div>
      <StepHeading
        title="Review"
        description="Everything looks right? Both parties will sign via wallet before anything is locked."
      />
      <div className="divide-y divide-border rounded-lg border border-border">
        <div className="px-4 py-3">
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-2">Agreement</p>
          <div className="mt-1">
            {row("Title", v.title)}
            {row("Network", v.chain === "solana-mainnet" ? "Solana mainnet" : "Devnet")}
            {row("Value", formatUsd(v.totalAmount))}
            {v.tags.length > 0 && row("Tags", v.tags.join(", "))}
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-2">Parties</p>
          <div className="mt-1">
            {row("Client", v.client.name)}
            {row("Client wallet", `${v.client.wallet.slice(0, 6)}…${v.client.wallet.slice(-4)}`)}
            {row("Provider", v.provider.name)}
            {row("Provider wallet", `${v.provider.wallet.slice(0, 6)}…${v.provider.wallet.slice(-4)}`)}
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-2">
            Milestones ({v.milestones.length})
          </p>
          <div className="mt-1">
            {v.milestones.map((m, i) => (
              <div key={i} className="flex items-start justify-between gap-4 py-2 text-[13px]">
                <span className="text-muted">
                  {i + 1}. {m.title}
                </span>
                <span className="font-mono text-foreground">{formatUsd(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-2">Evidence policy</p>
          <div className="mt-1">
            {row(
              "Accepted types",
              v.evidence.acceptedTypes.map((t) => evidenceTypeLabels[t]).join(", ")
            )}
            {row("Verified issuer", v.evidence.requiresVerifiedIssuer ? "Required" : "Optional")}
            {row("Review window", `${v.evidence.verificationWindow} days`)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({
  code,
  total,
  chain,
}: {
  code: string;
  total: number;
  chain: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-success/30 bg-success/10">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-foreground">Agreement drafted</h2>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
          <span className="font-mono text-foreground">{code}</span> was created on{" "}
          {chain === "solana-mainnet" ? "Solana mainnet" : "devnet"} with a total value of{" "}
          <span className="text-foreground">{formatUsd(total)}</span>. Invitations were sent to
          both parties.
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[12px] text-danger">{message}</p>;
}
