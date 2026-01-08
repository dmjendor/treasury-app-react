"use client";

import Image from "next/image";
import RandomBackground from "@/app/_components/RandomBackground";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white">
      {/* Background image layer (swap this with your RandomBackground component if you have one) */}
      <RandomBackground />

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="#top"
            className="text-sm font-semibold tracking-tight"
          >
            Party Treasury
          </a>

          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a
              className="hover:text-white"
              href="#features"
            >
              Features
            </a>
            <a
              className="hover:text-white"
              href="#how"
            >
              How it works
            </a>
            <a
              className="hover:text-white"
              href="#preview"
            >
              Preview
            </a>
            <a
              className="hover:text-white"
              href="#faq"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/15"
            >
              View demo
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

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
              desc="A single place to record gold, loot, and notes between sessions."
            />
            <GlassCard
              title="Split rules"
              desc="Track shares, party fund, and expenses without mental math."
            />
            <GlassCard
              title="Item history"
              desc="See when an item was added and who claimed it."
            />
            <GlassCard
              title="Export summaries"
              desc="Grab a clean recap for your notes or group chat."
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
              <div className="aspect-16/10 rounded-xl bg-white/10" />
              <p className="mt-3 text-xs text-white/60">
                Drop in a real screenshot later. This frame is ready for it.
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
              desc="No. One person can run the ledger, inviting others just makes it smoother."
            />
            <GlassCard
              title="Does it work for any system?"
              desc="Yes. If your game has loot and expenses, it fits."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Party Treasury</p>
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
