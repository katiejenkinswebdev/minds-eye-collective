import { createClient } from "@supabase/supabase-js";
import type { ContactInput } from "./validation";

export type StoreResult = "stored" | "skipped" | "failed";

export type LeadMeta = {
  ip: string;
  userAgent: string;
};

/**
 * Writes the lead to Supabase using the service role key, which bypasses RLS
 * and must never reach the client. Returns "skipped" when Supabase is not
 * configured so the app still runs keyless in development.
 */
export async function storeLead(
  lead: ContactInput,
  meta: LeadMeta
): Promise<StoreResult> {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return "skipped";

  try {
    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from("leads").insert({
      name: lead.name,
      email: lead.email,
      company: lead.company || null,
      outcome: lead.outcome,
      ip: meta.ip,
      user_agent: meta.userAgent,
    });

    if (error) {
      console.error("[contact] supabase insert failed:", error.message);
      return "failed";
    }

    return "stored";
  } catch (error) {
    console.error("[contact] supabase insert threw:", error);
    return "failed";
  }
}
