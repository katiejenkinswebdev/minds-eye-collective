/**
 * Verifies the leads table against the real Supabase project.
 *
 *   npx tsx scripts/check-db.ts
 *
 * Goes further than "does the table exist": it round-trips a canary row through
 * the exact column shape lib/leads.ts writes, so a column that is missing,
 * misnamed, or wrongly non-null fails here rather than on a real lead. The
 * canary is deleted afterwards.
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

const EXPECTED_COLUMNS = [
  "id",
  "created_at",
  "name",
  "email",
  "company",
  "outcome",
  "ip",
  "user_agent",
];

async function main() {
  loadEnvLocal();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("FAIL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.");
    console.error("      Fill them into .env.local, then re-run.");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`project: ${url}\n`);

  // 1. Does the table exist and is it readable with the service role?
  const { error: selectError } = await supabase
    .from("leads")
    .select("id")
    .limit(1);

  if (selectError) {
    console.error(`FAIL: cannot read public.leads -> ${selectError.message}`);
    if (/does not exist|find the table/i.test(selectError.message)) {
      console.error("      The migration has not been applied to this project.");
    }
    process.exit(1);
  }
  console.log("PASS  table public.leads exists and the service role can read it");

  // 2. Round-trip a canary through the real column shape.
  const canaryEmail = `canary+${Date.now()}@mindseyecollective.ai`;
  const { data: inserted, error: insertError } = await supabase
    .from("leads")
    .insert({
      name: "Schema canary",
      email: canaryEmail,
      company: null,
      outcome: "Verifying the leads table accepts the app's column shape.",
      ip: "127.0.0.1",
      user_agent: "check-db",
    })
    .select()
    .single();

  if (insertError) {
    console.error(`FAIL: insert rejected -> ${insertError.message}`);
    process.exit(1);
  }
  console.log("PASS  insert accepted the exact shape lib/leads.ts writes");

  // 3. Are all expected columns present, and are the defaults working?
  const missing = EXPECTED_COLUMNS.filter((c) => !(c in inserted));
  if (missing.length) {
    console.error(`FAIL: columns missing from the row: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log(`PASS  all ${EXPECTED_COLUMNS.length} expected columns present`);

  if (!inserted.id || !inserted.created_at) {
    console.error("FAIL: id or created_at default did not populate");
    process.exit(1);
  }
  console.log("PASS  id and created_at defaults populated");

  // 4. Clean up.
  const { error: deleteError } = await supabase
    .from("leads")
    .delete()
    .eq("id", inserted.id);

  if (deleteError) {
    console.error(
      `WARN: canary row ${inserted.id} could not be deleted -> ${deleteError.message}`
    );
    console.error("      Remove it by hand so it is not mistaken for a lead.");
    process.exit(1);
  }
  console.log("PASS  canary row cleaned up");

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  console.log(`\nleads table is ready. Real rows currently stored: ${count ?? 0}`);

  // 5. Can the public key read the table?
  //
  // The secret key bypasses RLS, so nothing above proves RLS is enforcing. Only
  // a request made as the public role can. Without that key this check is
  // skipped, and skipped is reported as skipped, never as a pass.
  const publicKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  console.log();
  if (!publicKey) {
    console.log(
      "SKIP  RLS enforcement unverified: set SUPABASE_PUBLISHABLE_KEY in"
    );
    console.log(
      "      .env.local to prove the public role cannot read leads."
    );
    return;
  }

  const anon = createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: leaked, error: anonError } = await anon
    .from("leads")
    .select("id, email")
    .limit(1);

  if (leaked && leaked.length > 0) {
    console.error("FAIL  the public key can READ leads. The table is exposed.");
    console.error("      Run: alter table public.leads enable row level security;");
    console.error("      and: revoke all on public.leads from anon, authenticated;");
    process.exit(1);
  }

  if (anonError) {
    console.log(`PASS  public key refused: ${anonError.message}`);
  } else {
    console.log("PASS  public key returned no rows");
  }

  // An empty read is ambiguous on an empty table, so try a write too.
  const { error: anonInsert } = await anon.from("leads").insert({
    name: "anon probe",
    email: `anon-probe+${Date.now()}@example.com`,
    outcome: "This insert must be rejected.",
  });

  if (!anonInsert) {
    console.error("FAIL  the public key can WRITE to leads. Anyone can spam it.");
    process.exit(1);
  }
  console.log(`PASS  public key cannot write: ${anonInsert.message}`);
}

main().catch((error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
