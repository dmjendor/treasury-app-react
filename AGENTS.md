# Party Treasury - Codex Agent Instructions (AGENTS.md)

These instructions apply to all code generated or modified by Codex in this repository.

## Architecture defaults

- Use Next.js App Router.
- Prefer Server Components for data fetching and Client Components only for interactivity.
- Supabase access is server only.
- Supabase access and queries must live under `app/_lib/` and never in Client Components.
- Client Components never import the Supabase client or data service directly.
- Client Components receive data as props from Server Components.
- Mutations happen through Server Actions in `app/_lib/actions/*`.
- Server Actions return `{ ok, error }` (no redirects).
- Use optimistic UI for mutations where appropriate, then call `router.refresh()`.

## Routing and modals

- Modals use intercepted routes under `app/@modal/(.)…`.
- Root layout renders `<Modal />` from the `{modal}` slot.
- The same route must work as a full page when opened directly and as a modal when navigated internally.

## Data layer rules

- Keep Supabase client creation centralized and server only.
- Prefer splitting the data layer by concern:
  - `app/_lib/data/supabase.server.js` exports `getSupabase()` (lazy singleton).
  - Domain modules: `app/_lib/data/vaults.data.js`, `currencies.data.js`, `containers.data.js`, etc.
- API route handlers should be thin:
  - session check (`const session = await auth();`)
  - validation of params/body
  - call data-layer function(s)
  - return JSON
- Do not write raw SQL in routes or actions. Use Supabase query builder in the data layer.

## Auth and vault scoping

- Session is retrieved using:
  - `const session = await auth();`
  - `const userId = session.user.userId`
- If `!session`, throw or return an auth error: `"You must be logged in."`
- All domain data is vault scoped.
- URL patterns are vault scoped (example): `/api/vaults/[vaultId]/currencies`.
- Always enforce vault boundaries in data functions (filter by `vault_id`) and verify access.
- For now, enforce ownership via `vaults.owner_id === userId` unless otherwise specified.

## Tailwind and UI style

- Tailwind theme tokens are defined via CSS `@theme` using OKLCH tokens:
  - `primary`, `accent`, `surface`, `ink`, `danger`, etc.
- UI style goals:
  - clean, minimal, dark fantasy themed
  - subtle interactions (no loud/glowy effects)
- Prefer one component per concern. Avoid duplicate form components.

## Imports

- Use absolute imports: `@/app/...`
- Avoid long relative dot chains.

## Documentation requirements

- Add a short file header comment at the top of new files.
- Add a short JSDoc block above every exported function only.
- JSDoc must follow this exact format:

/\*\*

- <One short imperative sentence describing what the function does.>
- @param {type} <name>
- @returns {Promise<type>}
  \*/

Rules:

- Description must be one short imperative sentence (e.g., "Create a currency in a vault.").
- Do not write "This function..." phrasing.
- Only include `@param` tags for actual parameters.
- Only include `@returns` when something is returned.
- Use `Promise<...>` for async functions.
- Do not include `@throws`, `@example`, markdown, or extra commentary.
- Do not add docblocks to internal (non-exported) helpers.

## Code generation constraints

- Do not move Supabase usage into Client Components.
- Do not introduce redirects inside Server Actions.
- Do not duplicate components that differ only slightly in form styling.
- When changing code, preserve existing patterns unless explicitly instructed to refactor.
