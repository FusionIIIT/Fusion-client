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

const files = walk(SRC);
const rel = (f) => path.relative(SRC, f);

const importers = files
  .filter(
    (f) =>
      /\.jsx?$/.test(f) && !f.endsWith(".test.js") && !f.endsWith(".test.jsx"),
  )
  .map((f) => {
    const source = fs.readFileSync(f, "utf8");
    const match = source.match(
      /^import\s+(\w+)\s+from\s+"([^"]+\.module\.css)";/m,
    );
    return match ? { file: f, source, ident: match[1], href: match[2] } : null;
  })
  .filter(Boolean);

describe("CSS modules", () => {
  it("finds stylesheet importers to check", () => {
    expect(importers.length).toBeGreaterThan(0);
  });

  it.each(importers.map((i) => [rel(i.file), i]))(
    "%s imports a stylesheet that exists",
    (_name, entry) => {
      const target = path.resolve(path.dirname(entry.file), entry.href);
      expect(fs.existsSync(target)).toBe(true);
    },
  );

  it.each(importers.map((i) => [rel(i.file), i]))(
    "%s references only classes its stylesheet defines",
    (_name, entry) => {
      const target = path.resolve(path.dirname(entry.file), entry.href);
      const css = fs.readFileSync(target, "utf8");
      const defined = new Set(
        [...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]),
      );
      const used = new Set(
        [
          ...entry.source.matchAll(
            new RegExp(`\\b${entry.ident}\\.([a-zA-Z]\\w*)`, "g"),
          ),
        ].map((m) => m[1]),
      );
      expect([...used].filter((c) => !defined.has(c))).toEqual([]);
    },
  );

  it.each(importers.map((i) => [rel(i.file), i]))(
    "%s passes no scoped class as a string literal",
    (_name, entry) => {
      const target = path.resolve(path.dirname(entry.file), entry.href);
      const css = fs.readFileSync(target, "utf8");
      const escaped = new Set(
        [...css.matchAll(/:global\(\.([\w-]+)\)/g)].map((m) => m[1]),
      );
      const scoped = new Set(
        [...css.matchAll(/\.([a-zA-Z][\w-]*)/g)]
          .map((m) => m[1])
          .filter((c) => !escaped.has(c)),
      );
      const values = [
        ...entry.source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g),
      ]
        .map((m) => m[1] ?? m[2] ?? "")
        .map((value) => value.replace(/\w+\[\s*["'][^"']*["']\s*\]/g, " "));
      const literals = values
        .flatMap((value) => [
          ...value.replace(/\$\{[^}]*\}/g, " ").split(/\s+/),
          ...[...value.matchAll(/["']([^"']*)["']/g)].flatMap((q) =>
            q[1].split(/\s+/),
          ),
        ])
        .filter(Boolean);
      expect(literals.filter((token) => scoped.has(token))).toEqual([]);
    },
  );

  it("keeps every stylesheet either paired with its component or in styles/", () => {
    const orphans = files
      .filter((f) => f.endsWith(".module.css"))
      .filter((f) => {
        if (path.basename(path.dirname(f)) === "styles") return false;
        const base = path.basename(f, ".module.css");
        return !fs.existsSync(path.join(path.dirname(f), `${base}.jsx`));
      })
      .map(rel);
    expect(orphans).toEqual([]);
  });

  it("has no stylesheet imported across module boundaries", () => {
    const crossModule = importers
      .filter(
        (i) =>
          i.href.includes("../Modules/") ||
          /\.\.\/\.\.\/\.\.\/\.\.\/Modules\//.test(i.href),
      )
      .map((i) => `${rel(i.file)} -> ${i.href}`);
    expect(crossModule).toEqual([]);
  });
});
