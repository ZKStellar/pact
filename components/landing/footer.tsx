import Link from "next/link";
import { PactLogo } from "@/components/app/pact-logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Agreements", href: "/agreements" },
      { label: "Mediations", href: "/mediations" },
      { label: "Evidence", href: "/evidence" },
      { label: "Wallet", href: "/wallet" },
      { label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API reference", href: "/api-docs" },
      { label: "TypeScript SDK", href: "/api-docs#sdk" },
      { label: "Webhooks", href: "/api-docs#webhooks" },
      { label: "Status", href: "/api-docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Security", href: "/#security" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "mailto:hello@pact.sh" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/" },
      { label: "Privacy", href: "/" },
      { label: "Agreement template", href: "/agreements/new" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <PactLogo size={22} />
              <span className="text-[15px] font-semibold tracking-tight">
                Pact
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Every agreement deserves assurance. Programmable agreement
              infrastructure for businesses and developers.
            </p>
            <div className="mt-6 flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-[12px] text-muted-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              All systems operational
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[13px] font-semibold text-foreground">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-muted-2">
            © 2026 Pact Labs, Inc. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-muted-2">
            settled on Stellar · usdc
          </p>
        </div>
      </div>
    </footer>
  );
}
