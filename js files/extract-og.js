import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function getLinks(baseUrl) {
  const res = await fetch(baseUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  let links = new Set();
  $("a").each((_, el) => {
    let href = $(el).attr("href");
    if (href && href.startsWith("/") && !href.startsWith("//")) {
      links.add(new URL(href, baseUrl).href);
    } else if (href && href.startsWith(baseUrl)) {
      links.add(href);
    }
  });

  return [...links];
}

async function extractOGTags(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  let ogTags = {};
  $("meta").each((_, el) => {
    const property = $(el).attr("property");
    const content = $(el).attr("content");
    if (property && property.startsWith("og:")) {
      ogTags[property] = content;
    }
  });
  return ogTags;
}

(async () => {
  const baseUrl = "https://www.freshelementsrestaurant.com.np/";
  const pages = await getLinks(baseUrl);

  for (const page of pages) {
    const og = await extractOGTags(page);
    console.log(`Page: ${page}`);
    console.log("OG Tags:", og);
  }
})();
