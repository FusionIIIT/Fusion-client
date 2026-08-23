import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(__dirname, "..");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(SRC).filter((f) => /\.(jsx?|css)$/.test(f));
const rel = (f) => path.relative(SRC, f);
const read = (f) => fs.readFileSync(f, "utf8");

describe("responsive guards", () => {
  it("uses no vw-based font sizes", () => {
    const offenders = [];
    files.forEach((f) => {
      [...read(f).matchAll(/font-?[sS]ize:\s*['"]?([\d.]+)vw/g)].forEach(
        (m) => {
          const px = (parseFloat(m.group ?? m[1]) * 320) / 100;
          offenders.push(`${rel(f)}: ${m[1]}vw = ${px.toFixed(1)}px at 320w`);
        },
      );
    });
    expect(offenders).toEqual([]);
  });

  it("uses no 100vw widths, which ignore the scrollbar and ancestor padding", () => {
    const offenders = files
      .filter((f) =>
        /(?:max-width|maxWidth|width)\s*[:=]\s*[^;\n]*100vw/.test(read(f)),
      )
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it("keeps the global table overflow guard in index.css", () => {
    const css = read(path.join(SRC, "index.css"));
    expect(css).toMatch(/:where\(\*:has\(> table\)\)/);
    expect(css).toMatch(/overflow-x:\s*auto/);
  });

  it("keeps the global media width guard in index.css", () => {
    expect(read(path.join(SRC, "index.css"))).toMatch(
      /:where\(img, video, canvas\)/,
    );
  });

  it("declares no viewport-exceeding fixed width outside a media query", () => {
    const offenders = [];
    files
      .filter((f) => f.endsWith(".jsx"))
      .forEach((f) => {
        [
          ...read(f).matchAll(/(?<!max-)(?<!min-)\bwidth:\s*['"]?(\d{3,})px/g),
        ].forEach((m) => {
          if (Number(m[1]) > 320) offenders.push(`${rel(f)}: width ${m[1]}px`);
        });
      });
    expect(offenders).toEqual([]);
  });
});
