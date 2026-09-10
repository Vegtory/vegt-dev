#!/usr/bin/env node
/**
 * Compare components copied into this site against their source in the
 * astro-template submodule, and report which ones have upstream changes.
 *
 * Reads the provenance stamp at the top of each file. Run with:
 *   pnpm check:template
 *
 * See astro-template/docs/updating.md for what to do with the output.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const SITE_DIRS = ["src/components", "src/layouts"];
const TEMPLATE_DIRS = [
  "astro-template/astro/components",
  "astro-template/astro/layouts",
  "astro-template/astro/mdx-components",
];

/** Pull `@key value` pairs out of the stamp comment. */
function readStamp(source) {
  const header = source.slice(0, 800);
  const field = (name) =>
    header.match(new RegExp(`@${name}\\s+(\\S+)`))?.[1] ?? undefined;

  const component = field("component");
  if (!component) return undefined;

  return {
    component,
    version: field("version") ?? "0.0.0",
    source: field("source"),
    modified: field("modified") === "true",
  };
}

async function collect(dirs) {
  const found = new Map();
  for (const dir of dirs) {
    let entries;
    try {
      entries = await readdir(dir);
    } catch {
      continue; // directory may not exist in every site
    }
    for (const name of entries) {
      if (!name.endsWith(".astro")) continue;
      const stamp = readStamp(await readFile(path.join(dir, name), "utf8"));
      if (stamp) found.set(stamp.component, stamp);
    }
  }
  return found;
}

const parse = (v) => v.split(".").map(Number);

/** Returns "major" | "minor" | "patch" | undefined if `to` is not ahead. */
function bumpKind(from, to) {
  const [fa, fi, fp] = parse(from);
  const [ta, ti, tp] = parse(to);
  if (ta > fa) return "major";
  if (ta === fa && ti > fi) return "minor";
  if (ta === fa && ti === fi && tp > fp) return "patch";
  return undefined;
}

const site = await collect(SITE_DIRS);
const template = await collect(TEMPLATE_DIRS);

if (site.size === 0) {
  console.log("No stamped components found under", SITE_DIRS.join(", "));
  process.exit(0);
}

const rows = [];
for (const [name, local] of [...site].sort()) {
  const upstream = template.get(name);

  if (!upstream) {
    rows.push([name, local.version, "—", local.modified, "not in template"]);
    continue;
  }

  const kind = bumpKind(local.version, upstream.version);
  const status = !kind
    ? "up to date"
    : local.modified
      ? `${kind} behind — merge`
      : `${kind} behind — safe re-copy`;

  rows.push([name, local.version, upstream.version, local.modified, status]);
}

const headers = ["Component", "local", "template", "modified", "status"];
const widths = headers.map((h, i) =>
  Math.max(h.length, ...rows.map((r) => String(r[i]).length)),
);
const line = (cells) =>
  cells.map((c, i) => String(c).padEnd(widths[i])).join("  ").trimEnd();

console.log(line(headers));
for (const row of rows) console.log(line(row));

const behind = rows.filter((r) => r[4].includes("behind"));
console.log(
  behind.length
    ? `\n${behind.length} component(s) behind. See astro-template/docs/updating.md.`
    : "\nEverything is up to date.",
);
