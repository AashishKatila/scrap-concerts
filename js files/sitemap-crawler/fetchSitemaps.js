import fetch from "node-fetch";
import xml2js from "xml2js";
import { makeAbsoluteUrl } from "./utils.js";

async function fetchSitemap(url) {
  try {
    const res = await fetch(url);
    // console.log("Response :", res);
    if (!res.ok) {
      console.log(`[sitemap] Failed to fetch ${url}`);
      return [];
    }

    const xml = await res.text();
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(xml);

    if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
      const subSitemaps = parsed.sitemapindex.sitemap.map((s) => s.loc[0]);
      console.log(
        `[sitemap] Found sitemap index with ${subSitemaps.length} sub-sitemaps`
      );
      let allUrls = [];
      for (const sub of subSitemaps) {
        const subUrls = await fetchSitemap(makeAbsoluteUrl(url, sub));
        allUrls = allUrls.concat(subUrls);
      }
      return allUrls;
    }

    if (parsed.urlset && parsed.urlset.url) {
      const urls = parsed.urlset.url.map((u) => u.loc[0]);
      console.log(`[sitemap] Found ${urls.length} URLs in ${url}`);
      return urls;
    }

    console.log(`[sitemap] No URLs found in ${url}`);
    return [];
  } catch (err) {
    console.error(`[sitemap] Error parsing ${url}:`, err.message);
    return [];
  }
}

export default fetchSitemap;
