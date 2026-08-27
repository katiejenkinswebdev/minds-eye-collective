/**
 * Anything that names the business or its domain lives here and nowhere else.
 *
 * The design handoff was written against mindseyecollective.com, which is not
 * ours: it is registered to a third party through Squarespace and currently
 * serves an expired-site 404. The registered domain is mindseyecollective.ai.
 */
export const SITE = {
  name: "Minds Eye Collective",
  domain: "mindseyecollective.ai",
  url: "https://mindseyecollective.ai",
  title: "Minds Eye Collective — Custom AI systems and enablement",
  description:
    "Custom-built AI systems and hands-on enablement for organizations that want outcomes, not experiments.",
  /** Shown publicly in the contact form's error fallback copy. */
  contactEmail: "hello@mindseyecollective.ai",
} as const;
