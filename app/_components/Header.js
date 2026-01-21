import Link from "next/link";
import { auth } from "@/app/_lib/auth";
import { LinkButton } from "@/app/_components/LinkButton";

async function Header() {
  const session = await auth();
  console.log("session", session);
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-overlay backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="text-sm font-semibold tracking-tight text-fg"
        >
          Party Treasury
        </a>
        {!session?.user && (
          <nav className="hidden items-center gap-6 text-sm text-muted-fg md:flex">
            <a
              className="hover:text-fg"
              href="#features"
            >
              Features
            </a>
            <a
              className="hover:text-fg"
              href="#how"
            >
              How it works
            </a>
            <a
              className="hover:text-fg"
              href="#preview"
            >
              Preview
            </a>
            <a
              className="hover:text-fg"
              href="#faq"
            >
              FAQ
            </a>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {session?.user ? (
            <LinkButton
              variant="primary"
              href="/account"
              className="hover:text-fg transition-colors flex items-center gap-4 text-fg"
            >
              <img
                src={session.user.image}
                alt={session.user.name}
                referrerPolicy="no-referrer"
                className="h-8 rounded-full"
              />
              <span>Account</span>
            </LinkButton>
          ) : (
            <>
              <LinkButton
                variant="primary"
                href="/demo"
                className="rounded-xl bg-btn-secondary-bg px-4 py-2 text-sm text-btn-secondary-fg hover:bg-btn-secondary-hover-bg"
              >
                View demo
              </LinkButton>
              <LinkButton
                variant="primary"
                href="/login"
                className="rounded-xl bg-btn-primary-bg px-4 py-2 text-sm font-semibold text-btn-primary-fg hover:bg-btn-primary-hover-bg"
              >
                Sign in
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
