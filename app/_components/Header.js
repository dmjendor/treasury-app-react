import Link from "next/link";
import { auth } from "@/app/_lib/auth";

async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="text-sm font-semibold tracking-tight"
        >
          Party Treasury
        </a>
        {!session && (
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
        )}

        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            <Link
              href="/account"
              className="hover:text-accent-400 transition-colors flex items-center gap-4"
            >
              <img
                src={session.user.image}
                alt={session.user.name}
                referrerPolicy="no-referrer"
                className="h-8 rounded-full"
              />
              <span>Account</span>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
