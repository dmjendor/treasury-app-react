// app/account/vaults/new/page.js
import VaultForm from "@/app/_components/VaultForm";

export default function EditVaultPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-ink-900">Create vault</h2>
      <VaultForm
        action={updateVaultAction}
        vault={vault}
        submitLabel="Save changes"
      />
    </div>
  );
}
