"use client";
import * as React from "react";

export function Skeleton({ className = "h-6 w-full" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
  );
}
