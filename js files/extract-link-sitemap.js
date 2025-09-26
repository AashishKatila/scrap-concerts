import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function getAllLinks(baseUrl) {
  const visited = new Set();
  const linksToVisit = [baseUrl];
  const allLinks = new Set();

  while (linksToVisit.length > 0) {
    const url = linksToVisit.shift();
    if (visited.has(url)) continue;

    console.log("Visiting:", url);

    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      $("a").each((_, el) => {
        let href = $(el).attr("href");
        if (!href) return;

        if (href.startsWith("#") || href.startsWith("javascript:")) return;

        if (href.startsWith("/")) {
          href = new URL(href, baseUrl).href;
        } else if (href.startsWith("./") || href.startsWith("../")) {
          href = new URL(href, url).href;
        }

        if (href.startsWith(baseUrl) && !allLinks.has(href)) {
          allLinks.add(href);
          linksToVisit.push(href);
        }
      });

      visited.add(url);
    } catch (err) {
      console.error("Error fetching page:", url, err.message);
    }
  }

  return [...allLinks];
}

(async () => {
  const baseUrl = "https://www.codse.com";
  const links = await getAllLinks(baseUrl);
  console.log(`Total links found: ${links.length}`);
  console.log(links);
})();
