"use client";
import { useOptimistic } from "react";
import ContainerCard from "./ContainerCard";
import { deleteContainerAction } from "@/app/_lib/actions";

export default function ContainerList({ containers, vaultId }) {
  const [optimisticContainers, optimisticDelete] = useOptimistic(
    containers,
    (curContainers, containerId) => {
      return curContainers.filter((container) => container.id !== containerId);
    }
  );

  async function handleDelete(containerId) {
    optimisticDelete(containerId);
    await deleteContainerAction(containerId, vaultId);
  }

  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:gap-12 xl:gap-14">
      {optimisticContainers.map((container) => (
        <ContainerCard
          key={container.id}
          container={container}
          vaultId={vaultId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
