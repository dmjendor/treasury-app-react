import ContainerCard from "./ContainerCard";

export default async function ContainerList({ containers, vaultId }) {
  if (!containers?.length) return null;

  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:gap-12 xl:gap-14">
      {containers.map((container) => (
        <ContainerCard
          key={container.id}
          container={container}
          vaultId={vaultId}
        />
      ))}
    </div>
  );
}
