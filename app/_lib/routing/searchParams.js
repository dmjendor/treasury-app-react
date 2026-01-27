/**
 * Safely resolve App Router params.
 * Always await params before accessing values.
 *
 * @param {Promise<Record<string, string>> | Record<string, string>} params
 * @returns {Promise<Record<string, string>>}
 */
export async function getSearchParams(searchParams) {
  return await searchParams;
}
