/**
 * Terms of Service
 *
 * Party Treasury
 *
 * Notes
 * - Plain language, early stage friendly
 * - Uses semantic Tailwind tokens only
 */
export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold text-fg">Terms of Service</h1>

        <p className="mt-4 text-sm text-muted-fg">
          These Terms of Service govern your use of Party Treasury. By accessing or using the
          service, you agree to these terms.
        </p>

        <section className="mt-8 space-y-4 text-sm text-fg">
          <h2 className="text-base font-semibold text-fg">1. The service</h2>
          <p className="text-muted-fg">
            Party Treasury is an inventory and treasury tracking tool for tabletop style play. The
            service may change over time, and features may be added, modified, or removed.
          </p>

          <h2 className="text-base font-semibold text-fg">2. Accounts and access</h2>
          <p className="text-muted-fg">
            Sign in is provided through OAuth providers (Google, Facebook, and Twitch) via
            NextAuth. You are responsible for maintaining the security of your account and for
            all activity that occurs under your account.
          </p>

          <h2 className="text-base font-semibold text-fg">3. Vaults, members, and permissions</h2>
          <p className="text-muted-fg">
            Vaults are owned by the account that created them. Vault owners may invite members and
            configure permissions. You agree not to access vault data you are not authorized to
            view.
          </p>

          <h2 className="text-base font-semibold text-fg">4. Your content</h2>
          <p className="text-muted-fg">
            You retain ownership of the content you add to the service, such as vault names,
            containers, currencies, treasures, and notes. You grant Party Treasury permission to
            store and process this content solely to provide the service.
          </p>

          <h2 className="text-base font-semibold text-fg">5. Acceptable use</h2>
          <p className="text-muted-fg">
            You agree not to misuse the service. This includes attempting to bypass access controls,
            interfere with operation, probe for vulnerabilities, or use the service to violate laws
            or rights of others.
          </p>

          <h2 className="text-base font-semibold text-fg">6. Third party services</h2>
          <p className="text-muted-fg">
            The service depends on third party providers such as Google, Facebook, Twitch,
            Supabase, and Vercel. Your use of those services may be governed by their own terms
            and policies.
          </p>

          <h2 className="text-base font-semibold text-fg">7. Availability and changes</h2>
          <p className="text-muted-fg">
            We aim to keep the service available, but we do not guarantee uninterrupted access.
            Maintenance, updates, and outages may occur. We may also suspend or discontinue the
            service at any time.
          </p>

          <h2 className="text-base font-semibold text-fg">8. Disclaimers</h2>
          <p className="text-muted-fg">
            The service is provided on an as is and as available basis. To the extent permitted by
            law, we disclaim warranties of merchantability, fitness for a particular purpose, and
            non infringement.
          </p>

          <h2 className="text-base font-semibold text-fg">9. Limitation of liability</h2>
          <p className="text-muted-fg">
            To the extent permitted by law, Party Treasury will not be liable for indirect,
            incidental, special, consequential, or punitive damages, or any loss of data, profits,
            or revenue, arising from your use of the service.
          </p>

          <h2 className="text-base font-semibold text-fg">10. Termination</h2>
          <p className="text-muted-fg">
            You may stop using the service at any time. We may suspend or terminate access if we
            reasonably believe you have violated these terms or used the service in a harmful way.
          </p>

          <h2 className="text-base font-semibold text-fg">11. Changes to these terms</h2>
          <p className="text-muted-fg">
            We may update these terms from time to time. Continued use of the service after changes
            become effective means you accept the updated terms.
          </p>

          <h2 className="text-base font-semibold text-fg">12. Contact</h2>
          <p className="text-muted-fg">
            Questions about these terms can be sent to 
            <a className="text-link hover:underline" href="mailto:admin@partytreasury.com">
              admin@partytreasury.com
            </a>
            .
          </p>

          <p className="pt-2 text-xs text-muted-fg">Last updated: January 29, 2026</p>
        </section>
      </div>
    </main>
  );
}
