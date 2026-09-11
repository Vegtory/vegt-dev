/**
 * Facts about this build, resolved once at build time.
 *
 * The footer shows a revision and an uptime, and the whole point of both is
 * that they are real. A hardcoded "v2.1" or a counter seeded from a made-up
 * launch date is a prop, and a reader who looks twice can tell — which costs
 * more credibility than the detail earns. So: `rev` comes from the build date,
 * `commit` from whatever the deploying platform put in the environment, and
 * `builtAt` is stamped here and counted up from in the browser.
 *
 * Everything degrades rather than throws. A site that fails to build because
 * `git` was missing from a container would be a remarkably silly way to lose a
 * deploy over a footer.
 */

// Statically imported rather than `require`d lazily. This module is evaluated
// only in component frontmatter, which runs in Node during `astro build`, so
// the builtin is always available there — whereas `require` is not defined in
// an ES module at all, so the lazy version silently threw on every build and
// the footer never showed a sha.
import { execSync } from "node:child_process";

/** Stamped when the module is first evaluated, i.e. during `astro build`. */
const builtAtDate = new Date();

/**
 * Short commit sha, if the platform offers one.
 *
 * Cloudflare Pages sets `CF_PAGES_COMMIT_SHA`; Workers builds set
 * `WORKERS_CI_COMMIT_SHA`. `GITHUB_SHA` covers a GitHub Actions deploy. Local
 * `pnpm dev` has none of them, and falls back to reading git directly — which
 * is wrapped, because a shallow clone or a missing binary must not be fatal.
 */
function resolveCommit(): string {
  const fromEnv =
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.WORKERS_CI_COMMIT_SHA ??
    process.env.GITHUB_SHA;

  if (fromEnv) return fromEnv.slice(0, 7);

  try {
    return execSync("git rev-parse --short=7 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();
  } catch {
    // No git binary, a tarball deploy, or a repo-less container. The footer
    // simply omits the sha; everything else still renders.
    return "";
  }
}

/** ISO instant of the build, for the browser to count up from. */
export const builtAt = builtAtDate.toISOString();

/**
 * Human revision, `YYYY.MM`. Deliberately coarse: this is a personal site that
 * ships when something is worth shipping, and a semantic version on it would
 * be pretending there is a release process.
 */
export const rev = `${builtAtDate.getUTCFullYear()}.${String(
  builtAtDate.getUTCMonth() + 1,
).padStart(2, "0")}`;

export const commit = resolveCommit();

export default { builtAt, rev, commit };
