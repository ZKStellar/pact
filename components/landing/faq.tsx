import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the escrow actually work?",
    a: "When an agreement is created, the value is locked into a program-derived escrow account on Solana. The Pact program is the only authority that can move those funds, and it only does so through approved transitions — milestone approval, mediation decisions, or refunds. No individual key can touch the escrow.",
  },
  {
    q: "What happens if the client and provider disagree?",
    a: "Either party can open a dispute on a milestone. The disputed amount stays locked, and the Pact Mediator begins reviewing immediately. It evaluates the submitted evidence against the milestone's acceptance criteria, asks each party clarifying questions, and documents its reasoning before issuing a recommendation. A human can always escalate to review.",
  },
  {
    q: "Is the AI mediator actually impartial?",
    a: "The mediator is bound to the agreement text — the acceptance criteria both parties signed — rather than to either party. Every finding, weighting, and reference is shown in the mediation timeline, and the decision explains exactly which evidence satisfied or failed each criterion. This transparency is what keeps it impartial.",
  },
  {
    q: "What kinds of evidence can be submitted?",
    a: "GitHub repositories and pull requests, live websites, PDFs, ZIP archives, images, videos, and documents. Each submission is content-hashed and versioned, so you can always see exactly what was evaluated and when it was submitted.",
  },
  {
    q: "Which chain and currency does Pact use?",
    a: "Pact settles on Solana mainnet in USDC. Solana's fast finality and low fees make it practical to move milestone payments of any size without giving up a meaningful share to network costs.",
  },
  {
    q: "Can I integrate Pact into my own product?",
    a: "Yes. The REST API and TypeScript SDK expose the full lifecycle — create, fund, evidence, approve, dispute, and settle. Webhooks stream agreement and dispute events to your backend so you can build on top of Pact rather than around it.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-[#0b0b0b] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-[13px] font-medium uppercase tracking-wider text-muted-2">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Questions, answered.
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-[15px] font-medium text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
