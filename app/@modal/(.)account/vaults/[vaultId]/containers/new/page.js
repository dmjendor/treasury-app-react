/**
 * Intercepted route for creating a new container.
 *
 * This renders inside the @modal parallel route so that navigating to
 * /account/vaults/[vaultId]/containers/new opens a modal instead of a full page
 * when triggered from inside the app. Direct navigation still uses the normal page route.
 */
import Modal from "@/app/_components/Modal";
import ContainerForm from "@/app/_components/ContainerForm";
import { createContainerAction } from "@/app/_lib/actions";

export default async function NewContainerModal({ params }) {
  const { vaultId } = await params;

  const action = async (prevState, formData) => {
    "use server";
    formData.set("vault_id", vaultId);
    return createContainerAction(formData);
  };

  return (
    <Modal title="New container">
      <ContainerForm
        action={action}
        vaultId={vaultId}
        submitLabel="Create container"
        successMode="close-modal"
      />
    </Modal>
  );
}
