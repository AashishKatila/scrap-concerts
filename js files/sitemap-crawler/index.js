import { fetchRobots, extractSitemapsFromRobots } from "./fetchRobots.js";
import fetchSitemap from "./fetchSitemaps.js";
import { COMMON_SITEMAP_PATHS, makeAbsoluteUrl } from "./utils.js";
import fs from "fs";

const filePath = "sitemap-crawler/urls.json";

let allURLS = [];
if (fs.existsSync(filePath)) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    allURLS = JSON.parse(data);
  } catch (err) {
    console.error("Error reading urls file:", err);
    allURLS = [];
  }
}

async function main(baseUrl) {
  let urls = [];

  const robotsText = await fetchRobots(baseUrl);
  if (robotsText) {
    const sitemaps = extractSitemapsFromRobots(robotsText);
    if (sitemaps.length > 0) {
      console.log(`[main] Found ${sitemaps.length} sitemap(s) in robots.txt`);
      for (const sitemapUrl of sitemaps) {
        const pages = await fetchSitemap(makeAbsoluteUrl(baseUrl, sitemapUrl));
        urls = urls.concat(pages);
      }
      console.log(`[main] Total URLs collected: ${urls.length}`);
      return urls;
    }
  }

  console.log(`[main] Trying common sitemap paths...`);
  for (const path of COMMON_SITEMAP_PATHS) {
    const sitemapUrl = makeAbsoluteUrl(baseUrl, path);
    const pages = await fetchSitemap(sitemapUrl);
    if (pages.length > 0) {
      urls = urls.concat(pages);
    }
  }

  const uniqueUrls = urls.filter((u) => !allURLS.includes(u));
  allURLS = allURLS.concat(uniqueUrls);

  fs.writeFileSync(filePath, JSON.stringify(allURLS, null, 2));
  console.log(`Saved ${allURLS.length} events to ${filePath}`);

  console.log(`[main] Finished. Total URLs collected: ${urls.length}`);
  return urls;
}

main("https://flypokhara.com/")
  .then((urls) => console.log("All URLs:", urls))
  .catch((err) => console.error(err));
