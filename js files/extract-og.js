import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

const baseUrl = "https://www.freshelementsrestaurant.com.np/";
const filePath = "og-tags.json";

let allOGTags = [];
if (fs.existsSync(filePath)) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    allOGTags = JSON.parse(data);
  } catch (err) {
    console.error("Error reading existing OG tags file:", err);
    allOGTags = [];
  }
}

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

        if (href.startsWith("/")) href = new URL(href, baseUrl).href;
        else if (href.startsWith("./") || href.startsWith("../"))
          href = new URL(href, url).href;

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

async function extractOGTags(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTags = {};
    $("meta").each((_, el) => {
      const property = $(el).attr("property");
      const content = $(el).attr("content");
      if (property && property.startsWith("og:")) {
        ogTags[property] = content;
      }
    });
    return ogTags;
  } catch (err) {
    console.error("Error extracting OG tags from:", url, err.message);
    return {};
  }
}

(async () => {
  const links = await getAllLinks(baseUrl);
  console.log(`Total pages found: ${links.length}`);

  for (const page of links) {
    const og = await extractOGTags(page);
    if (Object.keys(og).length === 0) continue;

    const entry = { page, ogTags: og };
    allOGTags.push(entry);

    console.log(`Extracted OG tags from: ${page}`);
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(allOGTags, null, 2), "utf-8");
    console.log(`Saved OG tags for ${allOGTags.length} pages to ${filePath}`);
  } catch (err) {
    console.error("Error saving OG tags:", err);
  }
})();
