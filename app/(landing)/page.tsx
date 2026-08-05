import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Architecture } from "@/components/landing/architecture";
import { ApiPreview } from "@/components/landing/api-preview";
import { Security } from "@/components/landing/security";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

function CtaBanner() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
        <div className="relative overflow-hidden rounded-xl border border-border bg-[#0c0c0c] px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 pact-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,black,transparent)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ship your next engagement with assurance built in.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              Create your first agreement in minutes. No lawyers, no trust
              fallbacks, no waiting on disputes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-6 text-[15px] font-medium text-black transition-all hover:bg-zinc-200 active:scale-[0.98] sm:w-auto"
              >
                Create an agreement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/api-docs"
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-6 text-[15px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface-2 sm:w-auto"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Architecture />
      <ApiPreview />
      <Security />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  );
}
