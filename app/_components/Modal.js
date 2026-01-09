"use client";

import { useRouter } from "next/navigation";

export default function Modal({ title, children }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => router.back()}
        className="absolute inset-0 bg-(--color-overlay)"
      />

      <div className="absolute left-1/2 top-1/2 w-[min(42rem,92vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-white/10 bg-surface-900/95 p-6 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink-900">{title}</h2>

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-ink-800 hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
