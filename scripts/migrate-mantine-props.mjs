import fs from "node:fs";
import path from "node:path";

const RULES = {
  Text: { weight: "fw", color: "c", align: "ta" },
  Title: { weight: "fw", color: "c", align: "ta" },
  Group: { spacing: "gap", position: "justify" },
  Stack: { spacing: "gap" },
};

const JUSTIFY = {
  apart: "space-between",
  center: "center",
  right: "flex-end",
  left: "flex-start",
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

function endOfOpeningTag(src, from) {
  let depth = 0;
  let quote = null;
  for (let i = from; i < src.length; i += 1) {
    const ch = src[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    else if (ch === ">" && depth === 0) return i;
  }
  return -1;
}

const targets = process.argv.slice(2);
const components = targets.length ? targets : Object.keys(RULES);
let renamed = 0;
const touched = new Set();

for (const file of walk("src").filter((f) => f.endsWith(".jsx"))) {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const component of components) {
    const rules = RULES[component];
    if (!rules) continue;
    const open = new RegExp(`<${component}(?=[\\s/>])`, "g");
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = open.exec(src))) {
      const tagStart = match.index + match[0].length;
      const tagEnd = endOfOpeningTag(src, tagStart);
      if (tagEnd < 0) break;
      const attrs = src.slice(tagStart, tagEnd);

      let next = attrs;
      for (const [from, to] of Object.entries(rules)) {
        let depth = 0;
        let quote = null;
        let out = "";
        for (let i = 0; i < next.length; i += 1) {
          const ch = next[i];
          if (quote) {
            out += ch;
            if (ch === quote) quote = null;
            continue;
          }
          if (ch === '"' || ch === "'" || ch === "`") quote = ch;
          else if (ch === "{") depth += 1;
          else if (ch === "}") depth -= 1;

          if (depth === 0 && /\s/.test(ch)) {
            const rest = next.slice(i + 1);
            const m = rest.match(new RegExp(`^${from}=`));
            if (m) {
              out += ch + `${to}=`;
              i += m[0].length;
              renamed += 1;
              continue;
            }
          }
          out += ch;
        }
        next = out;
      }

      if (component === "Group") {
        next = next.replace(
          /\bjustify="(apart|center|right|left)"/g,
          (_all, v) => `justify="${JUSTIFY[v]}"`,
        );
      }

      if (next !== attrs) {
        src = src.slice(0, tagStart) + next + src.slice(tagEnd);
        changed = true;
        open.lastIndex = tagStart + next.length;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, src);
    touched.add(file);
  }
}

process.stdout.write(
  `${components.join(", ")}: ${renamed} prop(s) renamed across ${touched.size} file(s)\n`,
);
