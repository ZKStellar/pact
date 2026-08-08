import Link from "next/link";
import { PactLogo } from "@/components/app/pact-logo";
import { Scale, FileCheck2, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <div className="flex w-full flex-col lg:w-[45%] lg:border-r lg:border-border">
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <PactLogo size={22} />
            <span className="text-[15px] font-semibold tracking-tight">Pact</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <div className="flex items-center justify-between px-6 pb-6 text-[13px] text-muted-2">
          <span>© 2026 Pact Labs</span>
          <div className="flex gap-4">
            <Link href="/" className="transition-colors hover:text-muted">
              Terms
            </Link>
            <Link href="/" className="transition-colors hover:text-muted">
              Privacy
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden flex-1 items-center lg:flex">
        <div className="relative mx-auto w-full max-w-md px-12">
          <div className="pointer-events-none absolute -inset-x-24 -top-24 bottom-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_65%)]" />
          <blockquote className="relative">
            <p className="text-xl font-medium leading-relaxed tracking-tight text-foreground">
              “We stopped chasing vendors for milestone payments and started
              spending that time building. If a deliverable meets the criteria,
              the escrow pays itself. It’s the first contract I’ve signed that
              actually polices itself.”
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-foreground">
                AK
              </div>
              <div>
                <p className="text-sm font-semibold">Amara Okafor</p>
                <p className="text-[13px] text-muted-2">
                  COO, Fintrail: 214 agreements settled
                </p>
              </div>
            </footer>
          </blockquote>

          <div className="relative mt-14 grid grid-cols-3 gap-3">
            {[
              { icon: Scale, label: "0 manual disputes" },
              { icon: FileCheck2, label: "418 evidence files" },
              { icon: ShieldCheck, label: "$1.28M escrowed" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-surface p-3 text-center"
              >
                <stat.icon className="mx-auto h-4 w-4 text-muted" />
                <p className="mt-2 text-[11px] leading-tight text-muted-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
