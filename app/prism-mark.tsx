/**
 * The hero mark, built to the geometry in README.md section 2.
 *
 * PLACEHOLDER CONTOUR: the eye contour path below is my approximation, not the
 * real brand geometry. Replace EYE_CONTOUR with the path from
 * design-package/public/logos/mark-prism-dark.svg before this ships.
 */
const EYE_CONTOUR = "M 10 60 Q 60 18 110 60 Q 60 102 10 60 Z";

export function PrismMark({ size = 200 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Minds Eye Collective mark"
      style={{ maxWidth: "100%" }}
    >
      <title>Minds Eye Collective mark</title>
      <defs>
        <linearGradient id="prism-pupil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9D8CFF" />
          <stop offset="0.55" stopColor="#D66BE8" />
          <stop offset="1" stopColor="#4FDCEB" />
        </linearGradient>
      </defs>

      <circle
        cx="60"
        cy="60"
        r="31"
        fill="none"
        stroke="#4FDCEB"
        strokeWidth="1"
        opacity="0.28"
      />
      <circle
        cx="60"
        cy="60"
        r="24"
        fill="none"
        stroke="#D66BE8"
        strokeWidth="1.2"
        opacity="0.5"
      />
      <path
        d={EYE_CONTOUR}
        fill="none"
        stroke="#F6F5FB"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="60" r="17" fill="url(#prism-pupil)" />
    </svg>
  );
}
