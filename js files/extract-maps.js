import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const filePath = "maps-data.json";

let allMaps = [];
if (fs.existsSync(filePath)) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    allMaps = JSON.parse(data);
  } catch (err) {
    console.error("Error reading existing JSON file:", err);
    allMaps = [];
  }
}

async function scrapeGoogleMaps(url) {
  try {
    const { data: html } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(html);

    const maps = [];

    $("iframe[src*='google.com/maps']").each((_, el) => {
      const iframe = $(el).attr("src");
      let latitude = null;
      let longitude = null;
      let name = null;

      if (!iframe) return;

      if (iframe.includes("pb=")) {
        const lonMatch = iframe.match(/!2d([-0-9.]+)/);
        const latMatch = iframe.match(/!3d([-0-9.]+)/);
        const nameMatch = iframe.match(/!2s([^!]+)/);

        latitude = latMatch ? parseFloat(latMatch[1]) : null;
        longitude = lonMatch ? parseFloat(lonMatch[1]) : null;
        name = nameMatch
          ? decodeURIComponent(nameMatch[1].replace(/\+/g, " "))
          : null;
      } else if (iframe.includes("q=")) {
        const urlObj = new URL(iframe);
        name = urlObj.searchParams.get("q") || null;
      }

      maps.push({ url, iframe, name, latitude, longitude });
    });

    return maps;
  } catch (err) {
    console.warn(`Skipping ${url} due to error: ${err.message}`);
    return [];
  }
}

(async () => {
  const sites = [
    "https://bhanjyangtravels.com",
    "https://www.freshelementsrestaurant.com.np",
    "https://www.treknepal.com",
    "https://byanjan.com/",
    "https://bello-blush.vercel.app",
    "https://anakibar.com.np",
    "https://www.suikhetrivervalleyresort.com",
  ];

  for (const site of sites) {
    const urlsToTry = [site, `${site}/contact`];

    for (const url of urlsToTry) {
      console.log(`Scraping Google Maps from: ${url}`);
      const results = await scrapeGoogleMaps(url);
      if (results.length > 0) {
        console.log("Found maps:", results);

        allMaps.push(...results);
        fs.writeFileSync(filePath, JSON.stringify(allMaps, null, 2), "utf-8");

        break;
      }
    }
  }

  console.log(`Scraping completed. Total entries saved: ${allMaps.length}`);
})();

