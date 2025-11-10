"use client";
export function Spinner({ className = "h-5 w-5 border-2" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
      role="status"
      aria-label="loading"
    />
  );
}
