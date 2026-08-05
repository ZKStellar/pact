"use client";

import { useEffect, useState } from "react";
import { CommandMenu } from "@/components/layout/command-menu";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const open = () => setCommandOpen(true);
    document.addEventListener("pact:open-command", open);
    return () => document.removeEventListener("pact:open-command", open);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-[220px] shrink-0 lg:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
