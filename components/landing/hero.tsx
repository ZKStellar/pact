"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Scale, Wallet } from "lucide-react";
import { HeroVisual } from "@/components/landing/hero-visual";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="pointer-events-none absolute inset-0 pact-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-medium text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Programmable agreement infrastructure
          </div>

          <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
            Every agreement
            <br />
            deserves assurance.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Pact turns agreements into executable systems. Securely hold funds,
            define milestones, collect verifiable evidence, and resolve disputes
            with an impartial, always-available AI mediator, from creation to
            settlement.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-6 text-[15px] font-medium text-black transition-all hover:bg-zinc-200 active:scale-[0.98] sm:w-auto"
            >
              Create an agreement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/api-docs"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 text-[15px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface-2 sm:w-auto"
            >
              <BookOpen className="h-4 w-4 text-muted" />
              Read documentation
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-muted-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-muted" /> Audited on-chain escrow
            </span>
            <span className="flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-muted" /> Impartial AI mediation
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-muted" /> USDC on Stellar
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto mt-20 max-w-4xl"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
