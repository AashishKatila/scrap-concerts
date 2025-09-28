export const COMMON_SITEMAP_PATHS = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/wp-sitemap.xml",
  "/sitemap1.xml",
  "/sitemap-index.xml",
  "/sitemap/sitemap.xml",
  "/sitemap_index.xml",
  "/sitemapindex.xml",
];

export function makeAbsoluteUrl(base, path) {
  try {
    new URL(path);
    return path;
  } catch (e) {
    return new URL(path, base).href;
  }
}
