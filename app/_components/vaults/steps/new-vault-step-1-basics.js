// app/_components/vaults/steps/new-vault-step-1-basics.js
"use client";

import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import SubCard from "@/app/_components/SubCard";

/**
 * Render the new vault wizard basics step.
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function NewVaultStepBasics({
  name,
  setName,
  systemId,
  setSystemId,
  themeId,
  setThemeId,
  systemsByFamily,
  sortedThemes,
  stepErrors,
  setStepErrors,
}) {
  return (
    <SubCard className="space-y-4">
      <div className="text-sm font-semibold text-fg">Step 1: Basics</div>
      <InputComponent
        id="vault-name"
        label="Vault name"
        placeholder="The Emerald Hoard"
        value={name}
        error={stepErrors.name}
        onChange={(e) => {
          setName(e.target.value);
          if (stepErrors.name) {
            setStepErrors((prev) => {
              const next = { ...prev };
              delete next.name;
              return next;
            });
          }
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="vault-system"
          label="System"
          hint="Select a game system"
          value={systemId}
          error={stepErrors.system_id}
          onChange={(e) => {
            setSystemId(e.target.value);
            if (stepErrors.system_id) {
              setStepErrors((prev) => {
                const next = { ...prev };
                delete next.system_id;
                return next;
              });
            }
          }}
        >
          <option value="">Choose system...</option>
          {[...systemsByFamily.entries()].map(([family, list]) => (
            <optgroup
              key={family}
              label={family}
            >
              {list.map((system) => (
                <option
                  key={system.id}
                  value={system.id}
                >
                  {system.name || "Unnamed system"}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        <Select
          id="vault-theme"
          label="Theme"
          hint="Select a visual theme"
          value={themeId}
          error={stepErrors.theme_id}
          onChange={(e) => {
            setThemeId(e.target.value);
            if (stepErrors.theme_id) {
              setStepErrors((prev) => {
                const next = { ...prev };
                delete next.theme_id;
                return next;
              });
            }
          }}
        >
          <option value="">Choose theme...</option>
          {sortedThemes.map((theme) => (
            <option
              key={theme.id}
              value={theme.id}
            >
              {theme.name || "Unnamed theme"}
            </option>
          ))}
        </Select>
      </div>
      <div className="text-xs text-muted-fg">
        System and theme will be wired later.
      </div>
    </SubCard>
  );
}
