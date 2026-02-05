// app/account/vaults/_components/VaultForm.jsx
function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-fg">{label}</div>
      {hint ? <div className="text-xs text-muted-fg">{hint}</div> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Toggle({ name, defaultChecked, label }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-input px-4 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-accent-500"
      />
      <span className="text-sm text-fg">{label}</span>
    </label>
  );
}

export default function VaultForm({
  action,
  vault,
  submitLabel = "Save",
  cancelHref = "/account/vaults",
}) {
  const defaults = {
    name: vault?.name ?? "",
    system_id: vault?.system_id ?? "",
    theme_id: vault?.theme_id ?? "",

    base_currency_id: vault?.base_currency_id ?? "",
    common_currency_id: vault?.common_currency_id ?? "",
    merge_split: vault?.merge_split ?? "base",

    vo_buy_markup: vault?.vo_buy_markup ?? 0,
    vo_sell_markup: vault?.vo_sell_markup ?? 0,
    item_buy_markup: vault?.item_buy_markup ?? 0,
    item_sell_markup: vault?.item_sell_markup ?? 0,

    allow_xfer_in: vault?.allow_xfer_in ?? true,
    allow_xfer_out: vault?.allow_xfer_out ?? false,
    treasury_split_enabled: vault?.treasury_split_enabled ?? true,
    reward_prep_enabled: vault?.reward_prep_enabled ?? true,
  };

  return (
    <form
      action={action}
      className="space-y-8"
    >
      {/* include id on edit so the action knows what to update */}
      {vault?.id ? (
        <input
          type="hidden"
          name="id"
          value={vault.id}
        />
      ) : null}

      {/* Basics */}
      <section className="rounded-2xl border border-border bg-card p-6 backdrop-blur">
        <Field
          label="Vault name"
          hint="Example: The Emerald Hoard"
        >
          <input
            name="name"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaults.name}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </Field>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="System (optional)">
            <input
              name="system_id"
              defaultValue={defaults.system_id}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg placeholder:text-muted-fg"
            />
          </Field>

          <Field label="Theme (optional)">
            <input
              name="theme_id"
              defaultValue={defaults.theme_id}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg placeholder:text-muted-fg"
            />
          </Field>
        </div>
      </section>

      {/* Currency rules */}
      <section className="rounded-2xl border border-border bg-card p-6 backdrop-blur">
        <h3 className="text-sm font-semibold text-fg">Currency rules</h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            label="Base currency (optional)"
            hint="Lowest denomination"
          >
            <input
              name="base_currency_id"
              defaultValue={defaults.base_currency_id}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg placeholder:text-muted-fg"
            />
          </Field>

          <Field
            label="Common currency (optional)"
            hint="Most common denomination"
          >
            <input
              name="common_currency_id"
              defaultValue={defaults.common_currency_id}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg placeholder:text-muted-fg"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Split method">
            <select
              name="merge_split"
              defaultValue={defaults.merge_split}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg"
            >
              <option value="base">
                Merge all into base currency before splitting
              </option>
              <option value="per_currency">
                Split each currency independently
              </option>
            </select>
          </Field>
        </div>
      </section>

      {/* Markups */}
      <section className="rounded-2xl border border-border bg-card p-6 backdrop-blur">
        <h3 className="text-sm font-semibold text-fg">Markups</h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Valuable buy markup (percent)">
            <input
              name="vo_buy_markup"
              type="number"
              step="0.01"
              defaultValue={defaults.vo_buy_markup}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg"
            />
          </Field>

          <Field label="Valuable sell markdown (%)">
            <input
              name="vo_sell_markup"
              type="number"
              step="1"
              min="0"
              defaultValue={defaults.vo_sell_markup}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg"
            />
          </Field>

          <Field label="Item buy markup (percent)">
            <input
              name="item_buy_markup"
              type="number"
              step="0.01"
              defaultValue={defaults.item_buy_markup}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg"
            />
          </Field>

          <Field label="Item sell markdown (%)">
            <input
              name="item_sell_markup"
              type="number"
              step="1"
              min="0"
              defaultValue={defaults.item_sell_markup}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-input-fg"
            />
          </Field>
        </div>
      </section>

      {/* Toggles */}
      <section className="rounded-2xl border border-border bg-card p-6 backdrop-blur">
        <h3 className="text-sm font-semibold text-fg">
          Permissions and features
        </h3>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Toggle
            name="allow_xfer_out"
            defaultChecked={defaults.allow_xfer_out}
            label="Allow transferring treasure out of this vault"
          />
          <Toggle
            name="allow_xfer_in"
            defaultChecked={defaults.allow_xfer_in}
            label="Allow transferring treasure into this vault"
          />
          <Toggle
            name="treasury_split_enabled"
            defaultChecked={defaults.treasury_split_enabled}
            label="Enable splitting treasure"
          />
          <Toggle
            name="reward_prep_enabled"
            defaultChecked={defaults.reward_prep_enabled}
            label="Enable reward prep"
          />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <a
          href={cancelHref}
          className="rounded-xl bg-btn-secondary-bg px-4 py-2 text-sm font-semibold text-btn-secondary-fg hover:bg-btn-secondary-hover-bg"
        >
          Cancel
        </a>

        <button
          type="submit"
          className="rounded-xl bg-btn-primary-bg px-5 py-2 text-sm font-semibold text-btn-primary-fg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
