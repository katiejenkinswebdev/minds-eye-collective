import { contactSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { storeLead } from "@/lib/leads";
import { notifyOwner } from "@/lib/notify";

/** Errors are deliberately opaque to the client. Detail goes to the logs only. */
function fail(error: string, status: number, headers?: HeadersInit) {
  return Response.json({ ok: false, error }, { status, headers });
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers);

  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return fail("rate_limited", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("invalid_request", 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) return fail("invalid_request", 400);

  const lead = parsed.data;

  // Honeypot. Accept silently so the bot cannot learn it was caught.
  if (lead.website) return Response.json({ ok: true });

  const meta = {
    ip,
    userAgent: request.headers.get("user-agent") ?? "unknown",
  };

  const [stored, notified] = await Promise.all([
    storeLead(lead, meta),
    notifyOwner(lead),
  ]);

  // The Supabase row is the durable record, so a Resend outage alone is not
  // fatal. What must never happen is reporting success while the lead exists
  // in neither place.
  if (stored === "stored" || notified === "sent") {
    return Response.json({ ok: true });
  }

  if (
    stored === "skipped" &&
    notified === "skipped" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.info("[contact] no backend configured, lead not persisted:", lead);
    return Response.json({ ok: true });
  }

  console.error(
    `[contact] lead lost. supabase=${stored} resend=${notified} email=${lead.email}`
  );
  return fail("server_error", 500);
}
