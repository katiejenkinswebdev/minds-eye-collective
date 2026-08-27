/**
 * Prints the leads captured by the contact form, newest first.
 *
 *   npm run leads           # the 20 most recent
 *   npm run leads -- 100    # more
 *   npm run leads -- --json # raw JSON, for piping somewhere else
 *
 * Until Resend is wired up, a lead arrives with no notification, so this is
 * how you find out someone got in touch.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

function wrap(text: string, width: number, indent: string) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > width) {
      lines.push(line.trim());
      line = word;
    } else {
      line += " " + word;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.map((l) => indent + l).join("\n");
}

async function main() {
  loadEnvLocal();

  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const limit = Number(args.find((a) => /^\d+$/.test(a)) ?? 20);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("FAIL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error, count } = await supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`FAIL: ${error.message}`);
    process.exit(1);
  }

  if (asJson) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (!data || data.length === 0) {
    console.log("No leads yet.");
    console.log("\nThe form is live at https://mindseyecollective.ai/#contact");
    console.log("Submit it yourself if you want to confirm capture is working.");
    return;
  }

  console.log(`${count} lead${count === 1 ? "" : "s"} total, showing ${data.length}\n`);

  for (const lead of data) {
    const when = new Date(lead.created_at).toLocaleString();
    console.log("─".repeat(72));
    console.log(`${lead.name}   <${lead.email}>`);
    console.log(`${when}${lead.company ? `   ${lead.company}` : ""}`);
    console.log();
    console.log(wrap(lead.outcome, 68, "  "));
    console.log();
    console.log(`  reply: ${lead.email}`);
  }
  console.log("─".repeat(72));
}

main().catch((error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
