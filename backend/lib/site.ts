// Canonical public origin for the site. Everything that needs an absolute URL
// (metadataBase, Open Graph tags, sitemap, robots) resolves through here so the
// production domain is defined in exactly one place.
//
// SITE_URL overrides it for staging/preview deployments; the default is the
// live domain so a plain `next build` on the real host is already correct.
const DEFAULT_SITE_URL = "https://ojaskaraabuilders.com";

function normalize(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export const siteUrl: string = normalize(process.env.SITE_URL?.trim() || DEFAULT_SITE_URL);

export const siteHost: string = new URL(siteUrl).host;

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteUrl}/`).toString();
}
