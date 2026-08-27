/**
 * Drives the real contact form in a browser and proves the lead reaches
 * Supabase, then removes the test row.
 *
 *   npx tsx scripts/e2e-contact.ts [baseUrl]
 *
 * This is the check worth running before a deploy and again straight after:
 * the API-level suite exercises the route, but only this covers the whole path
 * from a rendered input to a stored row, including the client component.
 */
import { readFileSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

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

  const base = process.argv[2] ?? "http://localhost:3000";
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("FAIL: Supabase env not set, cannot verify the row landed.");
    process.exit(1);
  }

  const marker = `e2e+${Date.now()}@mindseyecollective.ai`;
  const outcome = "End-to-end check: cut manual invoice handling by half.";

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(base, { waitUntil: "networkidle0", timeout: 60_000 });

    await page.type("#name", "End To End");
    await page.type("#email", marker);
    await page.type("#company", "Verification Co");
    await page.type("#outcome", outcome);

    console.log(`submitting as ${marker}`);
    await page.click('form button[type="submit"]');

    await page.waitForSelector('[role="status"]', { timeout: 30_000 });
    const successText = String(
      await page.evaluate(
        `document.querySelector('[role="status"]')?.innerText || ''`
      )
    ).trim();

    if (!successText.includes("Got it")) {
      console.error(`FAIL: unexpected success text: ${successText}`);
      process.exit(1);
    }
    console.log(`PASS  form showed the success state: "${successText}"`);

    const formGone = await page.evaluate(
      `document.querySelector('form') === null`
    );
    console.log(
      formGone
        ? "PASS  form was replaced by the confirmation"
        : "WARN  form is still on the page alongside the confirmation"
    );
  } finally {
    await browser.close();
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("email", marker)
    .single();

  if (error || !data) {
    console.error(
      `FAIL: no row stored for ${marker} -> ${error?.message ?? "not found"}`
    );
    process.exit(1);
  }

  console.log("PASS  row stored in Supabase");
  console.log(`        name       ${data.name}`);
  console.log(`        company    ${data.company}`);
  console.log(`        outcome    ${data.outcome}`);
  console.log(`        ip         ${data.ip}`);
  console.log(`        user_agent ${String(data.user_agent).slice(0, 60)}`);

  if (data.outcome !== outcome) {
    console.error("FAIL: stored outcome does not match what was typed");
    process.exit(1);
  }
  console.log("PASS  stored outcome matches what was typed");

  const { error: cleanupError } = await supabase
    .from("leads")
    .delete()
    .eq("id", data.id);

  if (cleanupError) {
    console.error(`WARN: could not delete test row ${data.id}`);
    process.exit(1);
  }
  console.log("PASS  test row cleaned up");

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });
  console.log(`\nreal rows remaining: ${count ?? 0}`);
}

main().catch((error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
