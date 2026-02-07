"use client";

import Image from "next/image";
import RandomBackground from "@/app/_components/RandomBackground";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white">
      {/* Background image layer (swap this with your RandomBackground component if you have one) */}
      <RandomBackground />

      {/* Hero */}
      <section
        id="top"
        className="mx-auto flex min-h-[85vh] max-w-6xl items-center px-6"
      >
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/85 backdrop-blur">
            Built for tabletop groups
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Track shared loot without spreadsheets or arguments
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
            Keep a shared ledger for treasure, items, and expenses so your party
            always knows what happened and who has what.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Sign in to start a party
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 text-sm text-white/90 backdrop-blur hover:bg-white/15"
            >
              Learn more
            </a>
          </div>

          <p className="mt-6 text-xs text-white/60">Scroll for details</p>
        </div>
      </section>

      {/* Sections */}
      <main className="mx-auto max-w-6xl space-y-16 px-6 pb-20">
        {/* Features */}
        <section
          id="features"
          className="scroll-mt-24"
        >
          <SectionHeader
            title="Features"
            subtitle="The essentials, without the clutter"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard
              title="Shared ledger"
              desc="Track coins, items, and notes in one timeline so the whole table knows what was found, sold, or spent."
            />
            <GlassCard
              title="Split rules"
              desc="Support party shares, GM shares, and leftover remainder handling without sticky note math."
            />
            <GlassCard
              title="Item history"
              desc="See when an item appeared, where it lives, and who is carrying it right now."
            />
            <GlassCard
              title="Export summaries"
              desc="Generate a clean session recap for your notes, group chat, or campaign doc."
            />
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="scroll-mt-24"
        >
          <SectionHeader
            title="How it works"
            subtitle="Three steps, then back to the adventure"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              num="1"
              title="Create a party"
              desc="Name your group and invite members."
            />
            <StepCard
              num="2"
              title="Add loot"
              desc="Record treasure, items, and expenses."
            />
            <StepCard
              num="3"
              title="Split and settle"
              desc="See balances clearly and keep it fair."
            />
          </div>
        </section>

        {/* Preview */}
        <section
          id="preview"
          className="scroll-mt-24"
        >
          <SectionHeader
            title="Preview"
            subtitle="A quick look at the vibe"
          />

          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-black/20">
                <Image
                  src="/screenshot.jpg"
                  alt="Screenshot preview of Party Treasury"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <p className="mt-3 text-xs text-white/60">
                Real vault view with containers, items, and balances.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold">
                Made for mid session updates
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Quick entry, clear totals, and history that does not disappear
                into a chat thread.
              </p>

              <div className="mt-5 space-y-3">
                <TinyRow
                  title="Fast input"
                  desc="Add loot in seconds."
                />
                <TinyRow
                  title="Clear splits"
                  desc="Everyone sees the same numbers."
                />
                <TinyRow
                  title="Clean history"
                  desc="Audit trail for the whole campaign."
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-24"
        >
          <SectionHeader
            title="FAQ"
            subtitle="Quick answers"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard
              title="Do I need everyone to sign up?"
              desc="No. One person can run the ledger. Invites just make it easier for players to view and update."
            />
            <GlassCard
              title="Does it work for any system?"
              desc="Yes. It is system-agnostic and works for any campaign with shared treasure."
            />
            <GlassCard
              title="What about private notes?"
              desc="Hidden containers keep GM-only or secret items out of the player view."
            />
            <GlassCard
              title="How do splits work?"
              desc="You can split by currency or merge to base, then keep a party share if you want."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) {new Date().getFullYear()} Party Treasury</p>
          <div className="flex gap-5">
            <a
              className="hover:text-white"
              href="/privacy"
            >
              Privacy
            </a>
            <a
              className="hover:text-white"
              href="/terms"
            >
              Terms
            </a>
            <a
              className="hover:text-white"
              href="/contact"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-white/75">{subtitle}</p>
      ) : null}
    </div>
  );
}

function GlassCard({ title, desc }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/80">{desc}</div>
    </div>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-sm font-semibold">
        {num}
      </div>
      <div className="mt-4 text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/80">{desc}</div>
    </div>
  );
}

function TinyRow({ title, desc }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/80">{desc}</div>
    </div>
  );
}
