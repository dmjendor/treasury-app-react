"use client";

import { Button } from "@/app/_components/Button";
import { useRouter } from "next/navigation";

export default function Modal({ title, children, themeKey }) {
  const router = useRouter();
  const theme = `theme-${themeKey ?? "light"}`;

  return (
    <div className={`fixed inset-0 z-50, ${theme}, bg-overlay text-fg`}>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => router.back()}
        className="absolute inset-0 bg-overlay"
      />

      {/* Centering + safe padding */}
      <div className="relative flex min-h-full items-center justify-center p-4">
        {/* Panel */}
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl max-h-[calc(100vh-2rem)] flex flex-col`}
        >
          {/* Header (sticky so you always have Close) */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-primary-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-primary-50">{title}</h2>

            <Button
              variant="accent"
              onClick={() => router.back()}
              className={`rounded-lg border border-border text-btn-secondary-fg px-3 py-2 text-sm hover:bg-btn-secondary-hover-bg cursor-pointer`}
            >
              X
            </Button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
