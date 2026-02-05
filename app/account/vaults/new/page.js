// app/account/vaults/new/page.js
import NewVaultWizard from "@/app/_components/NewVaultWizard";
import { getSystems } from "@/app/_lib/data/systems.data";
import { getThemes } from "@/app/_lib/data/themes.data";

/**
 * Render the new vault wizard page.
 * @returns {JSX.Element}
 */
export default async function NewVaultPage() {
  const [systems, themes] = await Promise.all([getSystems(), getThemes()]);
  return (
    <div className="max-w-4xl space-y-6">
      <NewVaultWizard
        systems={Array.isArray(systems) ? systems : []}
        themes={Array.isArray(themes) ? themes : []}
      />
    </div>
  );
}
