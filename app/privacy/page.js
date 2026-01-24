/**
 * Privacy Policy
 *
 * Party Treasury
 *
 * Notes
 * - Keep this page simple and server rendered
 * - Uses semantic Tailwind tokens only
 */
export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold text-fg">Privacy Policy</h1>

        <p className="mt-4 text-sm text-muted-fg">
          Party Treasury values your privacy. This Privacy Policy explains how information is
          collected, used, and protected when you use the Party Treasury website and services.
        </p>

        <section className="mt-8 space-y-4 text-sm text-fg">
          <h2 className="text-base font-semibold text-fg">Information we collect</h2>
          <p className="text-muted-fg">
            We collect information you provide directly, such as your name and email address when
            signing in using Google. We may also collect limited technical data such as browser
            type, device information, and usage data to help improve the service.
          </p>

          <h2 className="text-base font-semibold text-fg">How we use information</h2>
          <p className="text-muted-fg">
            Information is used to provide and maintain the service, manage user accounts, improve
            functionality, and communicate important updates. We do not sell or rent personal
            information.
          </p>

          <h2 className="text-base font-semibold text-fg">Authentication</h2>
          <p className="text-muted-fg">
            Party Treasury uses Google OAuth through NextAuth for authentication. We do not store
            your password.
          </p>

          <h2 className="text-base font-semibold text-fg">Data storage</h2>
          <p className="text-muted-fg">
            Application data is stored using Supabase. Access to vault data is restricted based on
            vault membership and permissions within the app.
          </p>

          <h2 className="text-base font-semibold text-fg">Cookies</h2>
          <p className="text-muted-fg">
            Cookies may be used to maintain sessions and improve your experience. You can disable
            cookies through your browser, but some enabling features may not function properly.
          </p>

          <h2 className="text-base font-semibold text-fg">Third party services</h2>
          <p className="text-muted-fg">
            We rely on third party services to operate the service, including Google for sign in,
            Supabase for data storage, and Vercel for hosting. These providers have their own
            privacy policies.
          </p>

          <h2 className="text-base font-semibold text-fg">Data sharing</h2>
          <p className="text-muted-fg">
            We share information only as needed to operate the service, to provide features you
            request, or to comply with legal obligations.
          </p>

          <h2 className="text-base font-semibold text-fg">Data retention</h2>
          <p className="text-muted-fg">
            We retain information only as long as necessary to provide the service, comply with
            legal requirements, or until you request deletion where applicable.
          </p>

          <h2 className="text-base font-semibold text-fg">Your choices</h2>
          <p className="text-muted-fg">
            You may request access, correction, or deletion of your data by contacting us.
          </p>

          <h2 className="text-base font-semibold text-fg">Changes to this policy</h2>
          <p className="text-muted-fg">
            We may update this policy from time to time. Continued use of the service after changes
            become effective means you accept the updated policy.
          </p>

          <h2 className="text-base font-semibold text-fg">Contact</h2>
          <p className="text-muted-fg">
            For privacy questions, contact 
            <a className="text-link hover:underline" href="mailto:admin@partytreasury.com">
              admin@partytreasury.com
            </a>
            .
          </p>

          <p className="pt-2 text-xs text-muted-fg">Last updated: January 21, 2026</p>
        </section>
      </div>
    </main>
  );
}
