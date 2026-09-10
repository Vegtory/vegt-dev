function reverseEmail(email) {
  return email.split('').reverse().join('');
}

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const EMAIL_TEST_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

function escapeHtmlAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function isHtmlResponse(contentType, html) {
  return (
    contentType.includes('text/html') ||
    /^\s*<!doctype html/i.test(html) ||
    /^\s*<html/i.test(html)
  );
}

function transformHtml(html) {
  let result = html.replace(
    /href=(["'])mailto:([^"']+)\1/gi,
    (_, __, mailtoTarget) =>
      `href="#" data-mailto="${escapeHtmlAttribute(reverseEmail(`mailto:${mailtoTarget}`))}" class="email-obscured-link" style="cursor:pointer;color:#2563eb;text-decoration:underline;" onmouseover="this.style.color='#1d4ed8'" onmouseout="this.style.color='#2563eb'" onclick="window.location.href=(this.dataset.mailto||'').split('').reverse().join(''); return false;"`,
  );

  result = result.replace(/>([^<]+)</g, (match, text) => {
    if (!EMAIL_TEST_RE.test(text)) return match;

    const replaced = text.replace(EMAIL_RE, (email) => {
      return `<span style="display:inline-block;direction:rtl;unicode-bidi:bidi-override;cursor:inherit;color:inherit;text-decoration:inherit;pointer-events:none;">${reverseEmail(email)}</span>`;
    });

    return `>${replaced}<`;
  });
  return result;
}

/**
 * Rewrite every generated page on disk.
 *
 * This runs in `astro:build:done` rather than a Vite `generateBundle` hook:
 * Astro writes static pages through its own build pipeline, so they never
 * appear as rollup assets and a bundle hook silently transforms nothing.
 */
async function transformBuiltPages(dir) {
  const { readdir, readFile, writeFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');

  const root = fileURLToPath(dir);
  let changed = 0;

  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.html')) {
        const html = await readFile(full, 'utf8');
        const transformed = transformHtml(html);
        if (transformed !== html) {
          await writeFile(full, transformed);
          changed++;
        }
      }
    }
  }

  await walk(root);
  return changed;
}

/** @returns {import('astro').AstroIntegration} */
export function emailObscurerIntegration() {
  return {
    name: 'email-obscurer',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const changed = await transformBuiltPages(dir);
        logger.info(`obscured email addresses in ${changed} page(s)`);
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((_req, res, next) => {
          const originalEnd = res.end.bind(res);
          const chunks = [];

          res.write = function (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            return true;
          };

          res.end = function (chunk, encoding, callback) {
            if (chunk)
              chunks.push(
                Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding),
              );

            const body = Buffer.concat(chunks);
            const html = body.toString();
            const contentType = String(res.getHeader('content-type') || '');
            if (isHtmlResponse(contentType, html)) {
              const transformed = transformHtml(html);

              if (!res.headersSent) {
                res.removeHeader('content-length');
                res.setHeader('content-length', Buffer.byteLength(transformed));
              }

              return originalEnd(transformed, encoding, callback);
            }

            return originalEnd(body, encoding, callback);
          };

          next();
        });
      },
    },
  };
}
