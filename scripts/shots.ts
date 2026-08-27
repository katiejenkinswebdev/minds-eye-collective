/**
 * Screenshots the running site at the three breakpoints the handoff calls out.
 *
 *   npm run dev
 *   npx tsx scripts/shots.ts [baseUrl] [outDir]
 *
 * Drives the installed Chrome rather than downloading one, matching the
 * puppeteer-core approach used in the other repos here.
 */
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const BREAKPOINTS = [
  { name: "375-mobile", width: 375, height: 900 },
  { name: "768-tablet", width: 768, height: 1024 },
  { name: "1440-desktop", width: 1440, height: 1000 },
];

async function main() {
  const baseUrl = process.argv[2] ?? "http://localhost:3000";
  const outDir = process.argv[3] ?? "test-output";

  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--hide-scrollbars"],
  });

  try {
    for (const breakpoint of BREAKPOINTS) {
      const page = await browser.newPage();
      await page.setViewport({
        width: breakpoint.width,
        height: breakpoint.height,
        deviceScaleFactor: 2,
      });

      const missing: string[] = [];
      page.on("response", (response) => {
        if (response.status() >= 400) missing.push(`${response.status()} ${response.url()}`);
      });

      await page.goto(baseUrl, { waitUntil: "networkidle0", timeout: 60_000 });

      const path = `${outDir}/${breakpoint.name}.png` as const;
      await page.screenshot({ path, fullPage: true });
      console.log(`wrote ${path}`);

      if (missing.length) {
        console.log(`  failed requests at ${breakpoint.name}:`);
        for (const entry of missing) console.log(`    ${entry}`);
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
