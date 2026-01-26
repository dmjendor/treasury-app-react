# Party Treasury – Codex Agent Instructions (AGENTS.md)

These instructions apply to all code generated or modified by Codex in this repository.

---

## Architecture defaults

- Use Next.js App Router.
- Prefer Server Components for data fetching and Client Components only for interactivity.
- Supabase is the database only. Supabase Auth is NOT used.
- Authentication is handled via NextAuth with Google OAuth.
- Supabase access is server only.
- Supabase access and queries must live under `app/_lib/` and never in Client Components.
- Client Components never import the Supabase client or data service directly.
- Client Components receive data as props from Server Components.
- Mutations happen through Server Actions in `app/_lib/actions/*`.
- Server Actions return `{ ok, error, data }`. No redirects.
- Use optimistic UI for mutations where appropriate, then call `router.refresh()`.
- Server Components may call data-layer functions directly when needed for layout or navigation data.

---

## Routing, layouts, and modals

- Modals use intercepted routes under `app/@modal/(.)…`.
- Root layout renders `<Modal />` from the `{modal}` slot.
- The same route must work as a full page when opened directly and as a modal when navigated internally.
- `/account` and `/public` routes share a common shell layout.
- Owner views live under:
  - `/account/vaults/[vaultId]`
- Player views live under:
  - `/public/vaults/[vaultId]`

---

## Navigation and SideNav rules

- SideNav is a Client Component and must not `await` data.
- SideNav data is fetched in a Server Component wrapper and passed as props.
- Member vault links route to `/public/vaults/[vaultId]`.
- Owned vault links route to `/account/vaults/[vaultId]`.
- Server Components fetch navigation data via data-layer functions, not actions.

---

## Data layer rules

- Supabase client creation is centralized and server only.
- Split data by concern:
  - `app/_lib/data/supabase.server.js` exports `getSupabase()`.
  - Domain modules: `vaults.data.js`, `permissions.data.js`, etc.
- Do not write raw SQL in routes or actions.
- Use the Supabase query builder in the data layer.
- Routes and actions should be thin:
  - session check
  - validation
  - data-layer call
  - return `{ ok, error, data }`

---

## Auth and vault scoping

- Retrieve session via:
  - `const session = await auth();`
  - `const userId = session.user.userId`
- If `!session`, return `"You must be logged in."`
- All domain data is vault scoped.
- Always enforce `vault_id` filtering in data functions.
- Never trust client-provided access.
- Ownership and permissions are enforced in:
  - data-layer logic
  - database RLS policies

---

## Members, permissions, and invites

- `permissions` table fields include:
  - `id`, `vault_id`, `user_id`, `email`
  - `can_view`
  - `transfer_coin_in/out`
  - `transfer_treasure_in/out`
  - `transfer_valuables_in/out`
  - `created_by`, `invited_at`, `accepted_at`
- Exactly ONE of `user_id` or `email` must be set.
- A row represents:
  - a member when `user_id IS NOT NULL`
  - an invite when `email IS NOT NULL`
- Uniqueness is enforced with UNIQUE constraints:
  - `(vault_id, user_id)`
  - `(vault_id, email)`
- Invites are accepted by matching the signed-in user’s email.
- Accepting an invite updates the existing row:
  - set `user_id`
  - clear `email`
  - set `accepted_at`
- All permission changes go through server actions.

---

## RLS requirements

- RLS is enabled on all tables.
- Vault owners can fully manage their vaults.
- Members with `can_view = true` can SELECT vault metadata.
- INSERT and UPDATE policies must both exist for UPSERTs.
- Do not use partial unique indexes for `ON CONFLICT`.
- RLS policies must reflect permission-based access.

---

## Email and invites

- Email sending is handled via Resend.
- Sending subdomain: `send.partytreasury.com`.
- DreamHost handles inbound mail.
- SPF and DKIM are configured.
- MX records for the sending subdomain are intentionally omitted.
- Invite emails contain signed tokens.
- Invite acceptance uses a server action with NextAuth session data.

---

## Imports

- Use absolute imports: `@/app/...`
- Avoid deep relative paths.

---

## Documentation requirements

- Add a short file header comment to new files.
- Add JSDoc only to exported functions.

JSDoc format:

```js
/**
 * <One short imperative sentence.>
 * @param {type} name
 * @returns {Promise<type>}
 */
```
