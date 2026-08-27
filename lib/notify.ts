import { Resend } from "resend";
import type { ContactInput } from "./validation";
import { SITE } from "./site";

export type NotifyResult = "sent" | "skipped" | "failed";

/**
 * Emails the new lead to the owner, with reply-to set to the lead so a reply
 * goes straight back to them. Returns "skipped" when Resend is not configured
 * so the app still runs keyless in development.
 */
export async function notifyOwner(lead: ContactInput): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) return "skipped";

  const subject = lead.company
    ? `New lead: ${lead.name} — ${lead.company}`
    : `New lead: ${lead.name}`;

  const body = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company || "(not given)"}`,
    "",
    "Outcome they are after:",
    lead.outcome,
    "",
    `Sent from ${SITE.url}`,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      replyTo: lead.email,
      text: body,
    });

    if (error) {
      console.error("[contact] resend send failed:", error.message);
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error("[contact] resend send threw:", error);
    return "failed";
  }
}
