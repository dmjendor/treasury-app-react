// app/_components/vaults/steps/new-vault-step-3-containers.js
"use client";

import { Button } from "@/app/_components/Button";
import ErrorMessage from "@/app/_components/ErrorMessage";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import SubCard from "@/app/_components/SubCard";

/**
 * Render the new vault wizard containers step.
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function NewVaultStepContainers({
  containers,
  newContainer,
  setNewContainer,
  defaultContainers,
  loadingDefaults,
  loadDefaultContainers,
  onAddDefaultContainer,
  onAddContainer,
  onRemoveContainer,
  stepErrors,
}) {
  return (
    <SubCard className="space-y-4">
      <div className="text-sm font-semibold text-fg">Step 3: Containers</div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={loadDefaultContainers}
          disabled={loadingDefaults}
        >
          {loadingDefaults ? "Loading..." : "Load defaults"}
        </Button>
        {defaultContainers.length > 0 ? (
          <Select
            id="default-container-select"
            label="Quick add"
            value=""
            onChange={(e) => {
              onAddDefaultContainer(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">Choose a default...</option>
            {defaultContainers.map((name) => (
              <option
                key={name}
                value={name}
              >
                {name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>

      {containers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-fg">
          No containers added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {containers.map((row) => (
            <div
              key={row.localId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div>
                <div className="font-semibold text-fg">
                  {row.name || "Unnamed container"}
                </div>
                <div className="text-xs text-muted-fg">
                  {row.is_hidden ? "Hidden" : "Visible"}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveContainer(row.localId)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <InputComponent
          id="new-container-name"
          label="Container name"
          value={newContainer.name}
          onChange={(e) =>
            setNewContainer((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
        <div className="flex items-end">
          <InputComponent
            id="new-container-hidden"
            label="Hidden"
            type="checkbox"
            checked={newContainer.is_hidden}
            onChange={(e) =>
              setNewContainer((prev) => ({
                ...prev,
                is_hidden: e.target.checked,
              }))
            }
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="primary"
            onClick={onAddContainer}
          >
            Add
          </Button>
        </div>
      </div>

      {stepErrors.containers ? (
        <ErrorMessage error={stepErrors.containers} />
      ) : null}

      <div className="text-xs text-muted-fg">
        Containers are local only until submission wiring is added.
      </div>
    </SubCard>
  );
}
