import ContainerForm from "@/app/_components/ContainerForm";
import { createContainerAction } from "@/app/_lib/actions";

export default async function NewContainerPage({ params }) {
  const { vaultId } = await params;
  const successHref = `/account/vaults/${encodeURIComponent(
    vaultId
  )}/containers`;

  const action = async (prevState, formData) => {
    "use server";
    formData.set("vault_id", vaultId);
    return createContainerAction(formData);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-ink-900">New container</h2>
      <ContainerForm
        action={action}
        submitLabel="Create container"
        vaultId={vaultId}
        successMode="navigate"
        successHref={successHref}
      />
    </div>
  );
}
