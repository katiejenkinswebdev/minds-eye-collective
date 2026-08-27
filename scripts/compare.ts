/**
 * Pixel-diffs the built page against the design file at each breakpoint.
 *
 *   npx tsx scripts/compare.ts test-output/built test-output/design
 *
 * Reports the first row where the two diverge, which localises drift far
 * better than a single overall percentage: any vertical offset early in the
 * page lights up every row below it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const BREAKPOINTS = ["375-mobile", "768-tablet", "1440-desktop"];
const THRESHOLD = 0.1;

function firstDivergentRow(
  a: PNG,
  b: PNG,
  width: number,
  height: number
): number | null {
  for (let y = 0; y < height; y++) {
    const rowA = Buffer.alloc(width * 4);
    const rowB = Buffer.alloc(width * 4);
    a.data.copy(rowA, 0, y * a.width * 4, y * a.width * 4 + width * 4);
    b.data.copy(rowB, 0, y * b.width * 4, y * b.width * 4 + width * 4);
    const differing = pixelmatch(rowA, rowB, undefined, width, 1, {
      threshold: THRESHOLD,
    });
    // A handful of pixels per row is antialiasing, not drift.
    if (differing > width * 0.02) return y;
  }
  return null;
}

function main() {
  const builtDir = process.argv[2] ?? "test-output/built";
  const designDir = process.argv[3] ?? "test-output/design";
  let worst = 0;

  for (const name of BREAKPOINTS) {
    const built = PNG.sync.read(readFileSync(`${builtDir}/${name}.png`));
    const design = PNG.sync.read(readFileSync(`${designDir}/${name}.png`));

    const width = Math.min(built.width, design.width);
    const height = Math.min(built.height, design.height);

    const diff = new PNG({ width, height });
    const cropped = (src: PNG) => {
      const out = new PNG({ width, height });
      for (let y = 0; y < height; y++) {
        src.data.copy(
          out.data,
          y * width * 4,
          y * src.width * 4,
          y * src.width * 4 + width * 4
        );
      }
      return out;
    };

    const a = cropped(built);
    const b = cropped(design);

    const differing = pixelmatch(a.data, b.data, diff.data, width, height, {
      threshold: THRESHOLD,
    });
    const pct = (differing / (width * height)) * 100;
    worst = Math.max(worst, pct);

    writeFileSync(`${builtDir}/../diff-${name}.png`, PNG.sync.write(diff));

    const row = firstDivergentRow(a, b, width, height);
    const heightNote =
      built.height === design.height
        ? "same height"
        : `height differs: built ${built.height}, design ${design.height}`;

    console.log(
      `${name.padEnd(14)} ${pct.toFixed(2)}% differing px  (${heightNote})`
    );
    console.log(
      `  first substantially different row: ${
        row === null ? "none" : `${row} of ${height} (device px)`
      }`
    );
  }

  console.log(`\nworst breakpoint: ${worst.toFixed(2)}%`);
}

main();
