/**
 * Verifies Resend is actually able to deliver a lead notification.
 *
 *   npx tsx scripts/check-email.ts
 *
 * Reports domain verification state, then sends one real test message to
 * CONTACT_TO_EMAIL. The contact route treats a Resend failure as non-fatal
 * (the Supabase row is the durable record), which is correct but means a
 * broken sender would otherwise stay invisible. This makes it visible.
 */
import { readFileSync } from "node:fs";
import { Resend } from "resend";

function loadEnvLocal() {
  let raw: string;
  try {
    raw = readFileSync(".env.local", "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (value && !process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey) {
    console.log("SKIP  RESEND_API_KEY is not set. Leads will be stored in");
    console.log("      Supabase but no email will be sent.");
    process.exit(1);
  }
  if (!to || !from) {
    console.error("FAIL  CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL is not set.");
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  // 1. Domain verification state.
  const domains = await resend.domains.list();
  const list = domains.data?.data ?? [];

  if (list.length === 0) {
    console.log("WARN  no domains registered in Resend.");
    console.log("      You can only send from onboarding@resend.dev, and only");
    console.log("      to your own Resend account address.");
  } else {
    for (const d of list) {
      const ok = d.status === "verified";
      console.log(
        `${ok ? "PASS" : "WARN"}  domain ${d.name}: ${d.status}${
          ok ? "" : "  (sending from it will fail until verified)"
        }`
      );
    }
  }

  const fromAddress = from.match(/<(.+)>/)?.[1] ?? from;
  const fromDomain = fromAddress.split("@")[1];
  const verifiedNames = list
    .filter((d) => d.status === "verified")
    .map((d) => d.name);

  if (
    fromDomain &&
    !fromDomain.endsWith("resend.dev") &&
    !verifiedNames.some((n) => fromDomain === n || fromDomain.endsWith(`.${n}`))
  ) {
    console.log(
      `WARN  CONTACT_FROM_EMAIL uses @${fromDomain}, which is not a verified`
    );
    console.log("      domain in this Resend account. The send below will fail.");
  }

  // 2. Actually send one.
  console.log(`\nsending a test message from ${fromAddress} to ${to}`);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Minds Eye Collective: delivery check",
    replyTo: "no-reply@example.com",
    text: [
      "This is the delivery check from scripts/check-email.ts.",
      "",
      "If you are reading this, a real lead notification will reach you too.",
      "Nothing is wrong and no action is needed.",
    ].join("\n"),
  });

  if (error) {
    console.error(`\nFAIL  send rejected: ${error.message}`);
    process.exit(1);
  }

  console.log(`PASS  accepted by Resend, id ${data?.id}`);
  console.log("\nCheck the inbox. If it does not arrive within a minute or two,");
  console.log("look at the Resend dashboard's Emails tab for the delivery status.");
}

main().catch((error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
