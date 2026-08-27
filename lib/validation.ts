import { z } from "zod";

/** Field limits come straight from the handoff spec. */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  company: z.string().trim().max(100).optional(),
  outcome: z.string().trim().min(1).max(2000),
  /**
   * Honeypot. Hidden from real users, so any value means a bot filled it. Kept
   * permissive on purpose: the route inspects it and silently accepts rather
   * than failing validation, which would tell the bot it had been spotted.
   */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
