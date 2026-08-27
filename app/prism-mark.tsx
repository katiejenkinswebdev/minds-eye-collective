/**
 * The hero mark, transcribed from the hero SVG in
 * ../landing-handoff/design/Minds Eye Landing Page - FINAL.dc.html.
 *
 * Note the stroke widths: the standalone mark-prism-dark.svg asset uses a
 * 6px contour and a 1.5px inner ring, but the hero in the design file uses 5
 * and 1.2. The design file wins for this page.
 */
export function PrismMark({ size = 200 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label="Minds Eye Collective mark"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <defs>
        <linearGradient id="hero-prism-pupil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9D8CFF" />
          <stop offset="0.55" stopColor="#D66BE8" />
          <stop offset="1" stopColor="#4FDCEB" />
        </linearGradient>
      </defs>
      <path
        d="M 10 60 C 38 26, 82 26, 110 60 C 82 94, 38 94, 10 60 Z"
        stroke="#F6F5FB"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle
        cx="60"
        cy="60"
        r="24"
        stroke="#D66BE8"
        strokeWidth="1.2"
        opacity="0.5"
      />
      <circle
        cx="60"
        cy="60"
        r="31"
        stroke="#4FDCEB"
        strokeWidth="1"
        opacity="0.28"
      />
      <circle cx="60" cy="60" r="17" fill="url(#hero-prism-pupil)" />
    </svg>
  );
}
