import { Resend } from "resend";

export async function sendInviteEmail({ toEmail, inviteUrl, vaultName }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("sendInviteEmail failed: missing RESEND_API_KEY");
    return { ok: false, error: "Email configuration is missing.", data: null };
  }

  const resend = new Resend(apiKey);

  const subject = vaultName
    ? `Party Treasury invite to ${vaultName}`
    : "Party Treasury invite";

  const text = vaultName
    ? `You were invited to join ${vaultName} on Party Treasury.\n\nOpen: ${inviteUrl}`
    : `You were invited to join a vault on Party Treasury.\n\nOpen: ${inviteUrl}`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;">
      <h2 style="margin: 0 0 12px 0;">Party Treasury invite</h2>
      <p style="margin: 0 0 12px 0;">
        ${vaultName ? `You were invited to join <b>${vaultName}</b>.` : "You were invited to join a vault."}
      </p>
      <p style="margin: 0 0 18px 0;">
        <a href="${inviteUrl}" style="display: inline-block; padding: 10px 14px; border-radius: 10px; text-decoration: none; background: #111; color: #fff;">
          View invite
        </a>
      </p>
      <p style="margin: 0; color: #555; font-size: 12px;">
        If you did not expect this, you can ignore this email.
      </p>
    </div>
  `;

  const from = "Party Treasury <invites@partytreasury.com>";
  let response = {};
  try {
    const res = await resend.emails.send({
      from,
      to: toEmail,
      subject,
      text,
      html,
    });

    response = { ok: true, data: res };
  } catch (error) {
    response = { ok: false, error: error?.message, data: error };
  } finally {
    return response;
  }
}
