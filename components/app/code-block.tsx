"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightCode(code: string): string {
  const escaped = escapeHtml(code);
  const tokenPattern =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|import|from|export|default|async|await|new|class|extends|if|else|for|while|true|false|null|undefined|try|catch|throw|type|interface|await|of|in)\b|\b(\d+(?:\.\d+)?)\b/g;

  return escaped.replace(tokenPattern, (match, comment, string, keyword, number) => {
    if (comment !== undefined)
      return `<span class="text-muted-2 italic">${match}</span>`;
    if (string !== undefined)
      return `<span class="text-success">${match}</span>`;
    if (keyword !== undefined)
      return `<span class="text-info">${match}</span>`;
    if (number !== undefined) return `<span class="text-warning">${match}</span>`;
    return match;
  });
}

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(() => highlightCode(code), [code]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className={cn(
        "group/code relative overflow-hidden rounded-lg border border-border bg-[#0d0d0d]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
        </div>
        <div className="flex items-center gap-3">
          {language && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-2">
              {language}
            </span>
          )}
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-success" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </button>
        </div>
      </div>
      <div className="code-scroll overflow-x-auto">
        <pre className="p-4 font-mono text-[13px] leading-relaxed">
          <code
            dangerouslySetInnerHTML={{ __html: highlighted }}
            className="block"
          />
        </pre>
      </div>
    </div>
  );
}
