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

const files = walk(SRC).filter((f) => f.endsWith(".jsx"));
const rel = (f) => path.relative(SRC, f);

function* openingTags(source) {
  const re = /<([A-Z][\w.]*)(?=[\s/>])/g;
  let match = re.exec(source);
  while (match) {
    const start = match.index + match[0].length;
    let depth = 0;
    let quote = null;
    let end = -1;
    for (let i = start; i < source.length; i += 1) {
      const ch = source[i];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
      else if (ch === "{") depth += 1;
      else if (ch === "}") depth -= 1;
      else if (ch === ">" && depth === 0) {
        end = i;
        break;
      }
    }
    if (end >= 0) yield [match[1], source.slice(start, end)];
    match = re.exec(source);
  }
}

function hasAttribute(attrs, name) {
  const pattern = new RegExp(`^${name}\\s*=`);
  let depth = 0;
  let quote = null;
  for (let i = 0; i < attrs.length; i += 1) {
    const ch = attrs[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    else if (depth === 0 && /\s/.test(ch) && pattern.test(attrs.slice(i + 1)))
      return true;
  }
  return false;
}

const sources = walk(SRC).filter(
  (f) =>
    /\.jsx?$/.test(f) && !f.endsWith(".test.js") && !f.endsWith(".test.jsx"),
);

const SELECTOR_KEY = /["'](@[\w-]+[^"']*|&[^"']*|:[a-z][\w-]*)["']\s*:/g;

const RETIRED = {
  Text: { weight: "fw", color: "c", align: "ta" },
  Title: { weight: "fw", color: "c", align: "ta" },
  Group: { spacing: "gap", position: "justify" },
  Stack: { spacing: "gap" },
  Button: { leftIcon: "leftSection", rightIcon: "rightSection" },
  TextInput: { icon: "leftSection" },
  Textarea: { icon: "leftSection" },
  Select: { icon: "leftSection" },
  MultiSelect: { icon: "leftSection" },
  NumberInput: { icon: "leftSection" },
  PasswordInput: { icon: "leftSection" },
  Autocomplete: { icon: "leftSection" },
  FileInput: { icon: "leftSection" },
  Modal: { overlayOpacity: "overlayProps", overlayBlur: "overlayProps" },
};

const RETIRED_JUSTIFY = ["apart", "right", "left"];

function findRetiredProps() {
  const offenders = [];
  files.forEach((file) => {
    const source = fs.readFileSync(file, "utf8");
    [...openingTags(source)].forEach(([tag, attrs]) => {
      const rules = RETIRED[tag];
      if (!rules) return;
      Object.entries(rules).forEach(([from, to]) => {
        if (hasAttribute(attrs, from)) {
          offenders.push(`${rel(file)}: <${tag} ${from}=…> should be ${to}`);
        }
      });
    });
  });
  return offenders;
}

describe("Mantine v7 props", () => {
  it("finds components to check", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("uses no prop Mantine 7 silently ignores", () => {
    expect(findRetiredProps()).toEqual([]);
  });

  it("uses no v6 Group position value for justify", () => {
    const offenders = [];
    files.forEach((file) => {
      const source = fs.readFileSync(file, "utf8");
      RETIRED_JUSTIFY.forEach((value) => {
        if (new RegExp(`justify="${value}"`).test(source)) {
          offenders.push(`${rel(file)}: justify="${value}"`);
        }
      });
    });
    expect(offenders).toEqual([]);
  });

  it("uses no other retired Mantine v6 API", () => {
    const offenders = [];
    files.forEach((file) => {
      const source = fs.readFileSync(file, "utf8");
      if (/\bonTabChange=/.test(source))
        offenders.push(`${rel(file)}: onTabChange`);
      if (/\bnothingFound=/.test(source))
        offenders.push(`${rel(file)}: nothingFound`);
    });
    expect(offenders).toEqual([]);
  });

  it("uses no sx prop, which Mantine 7 dropped", () => {
    const offenders = sources
      .filter((f) => /\bsx=/.test(fs.readFileSync(f, "utf8")))
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it("uses no theme.fn helper, which Mantine 7 dropped", () => {
    const offenders = sources
      .filter((f) => /\btheme\.fn\./.test(fs.readFileSync(f, "utf8")))
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it("puts no media query or nested selector in a style object", () => {
    const offenders = [];
    sources.forEach((file) => {
      const source = fs.readFileSync(file, "utf8");
      source.split("\n").forEach((line, index) => {
        [...line.matchAll(SELECTOR_KEY)].forEach((match) => {
          offenders.push(`${rel(file)}:${index + 1}: ${match[1]}`);
        });
      });
    });
    expect(offenders).toEqual([]);
  });
});
