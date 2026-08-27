import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — custom AI systems and enablement`;

/**
 * Prism mark on Void with the glow radial, per README.md's OG spec. Geometry
 * matches prism-mark.tsx, which is transcribed from the design file's hero.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          backgroundColor: "#0E0C24",
          backgroundImage:
            "radial-gradient(circle at 50% 40%, #241A4A 0%, #0E0C24 65%)",
        }}
      >
        <svg width="260" height="260" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="og-pupil" x1="0" y1="0" x2="1" y2="1">
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
            d="M 10 60 C 38 26, 82 26, 110 60 C 82 94, 38 94, 10 60 Z"
            fill="none"
            stroke="#F6F5FB"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="60" r="17" fill="url(#og-pupil)" />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 12,
            color: "#F6F5FB",
            opacity: 0.85,
          }}
        >
          MINDS EYE COLLECTIVE
        </div>
      </div>
    ),
    size
  );
}
