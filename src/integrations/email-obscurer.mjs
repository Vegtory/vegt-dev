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

function createBuildPlugin() {
  return {
    name: 'email-obscurer',
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.html')) {
          continue;
        }

        const html =
          typeof asset.source === 'string'
            ? asset.source
            : Buffer.from(asset.source).toString();

        asset.source = transformHtml(html);
      }
    },
  };
}

/** @returns {import('astro').AstroIntegration} */
export function emailObscurerIntegration() {
  return {
    name: 'email-obscurer',
    hooks: {
      'astro:config:setup': ({ updateConfig, command }) => {
        if (command === 'build') {
          updateConfig({
            vite: {
              plugins: [createBuildPlugin()],
            },
          });
        }
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
