// app/_components/TransferItemClient.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Section from "@/app/_components/Section";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import { transferTreasureToVaultAction } from "@/app/_lib/actions/treasures";
import { transferValuableToVaultAction } from "@/app/_lib/actions/valuables";
import { listContainersForVaultAction } from "@/app/_lib/actions/containers";
import ErrorMessage from "@/app/_components/ErrorMessage";

/**
 * Render the transfer item form.
 * @param {{ fromVaultId: string, fromVaultName: string, itemType: "treasure" | "valuable", itemId: string, itemName: string, fromContainerName?: string, targetVaults: Array<{ id: string, name: string }>, initialContainers?: Array<{ id: string, name: string }>, isModal?: boolean }} props
 * @returns {JSX.Element}
 */
export default function TransferItemClient({
  fromVaultId,
  fromVaultName,
  itemType,
  itemId,
  itemName,
  fromContainerName,
  targetVaults,
  initialContainers = [],
  isModal = false,
}) {
  const router = useRouter();
  const [selectedVaultId, setSelectedVaultId] = useState(
    targetVaults?.[0]?.id ? String(targetVaults[0].id) : "",
  );
  const [containers, setContainers] = useState(
    Array.isArray(initialContainers) ? initialContainers : [],
  );
  const [containerId, setContainerId] = useState(
    initialContainers?.[0]?.id ? String(initialContainers[0].id) : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const targetName = useMemo(() => {
    return (
      targetVaults.find((v) => String(v.id) === String(selectedVaultId))
        ?.name || ""
    );
  }, [targetVaults, selectedVaultId]);

  useEffect(() => {
    let cancelled = false;

    async function loadContainers() {
      if (!selectedVaultId) {
        setContainers([]);
        setContainerId("");
        return;
      }

      const res = await listContainersForVaultAction({
        vaultId: selectedVaultId,
      });

      if (cancelled) return;

      if (!res?.ok) {
        setContainers([]);
        setContainerId("");
        setError(res?.error || "Could not load containers.");
        return;
      }

      const next = Array.isArray(res.data) ? res.data : [];
      setContainers(next);
      setContainerId(next?.[0]?.id ? String(next[0].id) : "");
    }

    loadContainers();
    return () => {
      cancelled = true;
    };
  }, [selectedVaultId]);

  function close() {
    if (isModal) {
      router.back();
      return;
    }
    router.replace(`/public/vaults/${fromVaultId}`);
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setError("");

    if (!selectedVaultId || !containerId) {
      setError("Choose a vault and container.");
      return;
    }

    setBusy(true);
    const action =
      itemType === "treasure"
        ? transferTreasureToVaultAction
        : transferValuableToVaultAction;

    const res = await action({
      fromVaultId,
      toVaultId: selectedVaultId,
      containerId,
      treasureId: itemType === "treasure" ? itemId : undefined,
      valuableId: itemType === "valuable" ? itemId : undefined,
      treasureName: itemType === "treasure" ? itemName : undefined,
      valuableName: itemType === "valuable" ? itemName : undefined,
    });

    setBusy(false);

    if (!res?.ok) {
      setError(res?.error || "Transfer failed.");
      return;
    }

    toast.success("Transfer complete.");
    router.refresh();
    close();
  }

  const noTargets = !targetVaults || targetVaults.length === 0;

  return (
    <div className="p-6 max-w-2xl mx-auto text-fg space-y-4">
      <header className="space-y-1">
        {!isModal ? (
          <h1 className="text-xl font-semibold">Transfer {itemType}</h1>
        ) : null}
        <p className="text-sm text-fg">
          Move <span className="font-semibold">{itemName}</span> from{" "}
          <span className="font-semibold">{fromVaultName || "this vault"}</span>
          {fromContainerName ? ` (${fromContainerName})` : ""}.
        </p>
      </header>

      {noTargets ? (
        <Section>
          <div className="text-sm text-muted-fg">
            No destination vaults are available. You need transfer-in permission
            on another vault to move this item.
          </div>
        </Section>
      ) : (
        <Section>
          <form
            onSubmit={handleTransfer}
            className="space-y-4"
          >
            <Select
              label="Destination vault"
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
            >
              {targetVaults.map((vault) => (
                <option
                  key={vault.id}
                  value={vault.id}
                >
                  {vault.name}
                </option>
              ))}
            </Select>

            <Select
              label="Destination container"
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              disabled={!containers.length}
            >
              {!containers.length ? (
                <option value="">No containers available</option>
              ) : null}
              {containers.map((container) => (
                <option
                  key={container.id}
                  value={container.id}
                >
                  {container.name || "Unnamed container"}
                </option>
              ))}
            </Select>

            <ErrorMessage error={error} />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={busy}
              >
                {busy ? "Transferring..." : "Confirm transfer"}
              </Button>
            </div>
          </form>
        </Section>
      )}
    </div>
  );
}
