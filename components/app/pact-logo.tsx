import { cn } from "@/lib/utils";

export function PactLogo({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="white" />
      <path
        d="M9 11.5V20.5C9 21.8807 10.1193 23 11.5 23H20.5C21.8807 23 23 21.8807 23 20.5V11.5C23 10.1193 21.8807 9 20.5 9H11.5C10.1193 9 9 10.1193 9 11.5Z"
        stroke="#090909"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 14H20" stroke="#090909" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18H17" stroke="#090909" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PactLogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md bg-white",
        className
      )}
      style={{ width: size, height: size }}
    >
      <PactLogo size={size - 6} />
    </div>
  );
}
