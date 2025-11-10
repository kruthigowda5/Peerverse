"use client";
import * as React from "react";
import { Button } from "./button";

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
  className = "",
}: {
  page: number;
  total: number; // total items
  pageSize: number;
  onPageChange: (p: number) => void;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // simple windowed page numbers
  const window = 3;
  const start = Math.max(1, page - window);
  const end = Math.min(totalPages, page + window);
  const pages = [] as number[];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className={"flex items-center gap-2 " + className}>
      <Button className="h-8 px-3" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
        ‹ Prev
      </Button>
      {start > 1 && (
        <button className="h-8 px-2 text-sm text-gray-600" onClick={() => onPageChange(1)}>1</button>
      )}
      {start > 2 && <span className="text-gray-400">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`h-8 rounded px-3 text-sm ${p === page ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          {p}
        </button>
      ))}
      {end < totalPages - 1 && <span className="text-gray-400">…</span>}
      {end < totalPages && (
        <button className="h-8 px-2 text-sm text-gray-600" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
      )}
      <Button className="h-8 px-3" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
        Next ›
      </Button>
    </div>
  );
}
