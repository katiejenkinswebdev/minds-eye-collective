import type { NextConfig } from "next";
import { SITE } from "./lib/site";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Both the apex and www resolve to Vercel, and without this both serve
      // 200 for the same content. sitemap.ts and metadataBase both declare the
      // apex as canonical, so www permanently redirects to it. Scoped by host,
      // so the *.vercel.app deployment URLs are unaffected.
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${SITE.domain}` }],
        destination: `${SITE.url}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
