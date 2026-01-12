/**
 *
 * - Fetch a theme
 * - @param {Request} _request
 * - @param {{ params: Promise<{ themeId: string }> }} context
 * - @returns {Promise<Response>}
 */
export async function GET(_request, { params }) {
  try {
    const session = await auth();
    if (!session) throw new Error("You must be logged in.");

    const { themeId } = await params;
    if (!themeId)
      return json({ ok: false, error: "themeId is required." }, 400);

    const data = await getThemeKey(themeId);
    if (!data) return json({ ok: false, error: "Theme not found." }, 404);

    return json({ ok: true, data });
  } catch (err) {
    if (err?.message === "You must be logged in.")
      return json({ ok: false, error: err.message }, 401);
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
