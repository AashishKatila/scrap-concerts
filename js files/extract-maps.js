import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeGoogleMaps(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const maps = [];

    $("iframe[src*='google.com/maps']").each((_, el) => {
      const iframe = $(el).attr("src");
      let latitude = null;
      let longitude = null;
      let name = null;

      if (!iframe) {
        console.log("No iframe src found");
        return;
      }

      //  pb = contains lat/lng and business name
      if (iframe.includes("pb=")) {
        const lonMatch = iframe.match(/!2d([-0-9.]+)/);
        const latMatch = iframe.match(/!3d([-0-9.]+)/);
        const nameMatch = iframe.match(/!2s([^!]+)/);

        latitude = latMatch ? parseFloat(latMatch[1]) : null;
        longitude = lonMatch ? parseFloat(lonMatch[1]) : null;
        name = nameMatch
          ? decodeURIComponent(nameMatch[1].replace(/\+/g, " "))
          : null;

        // q = only contains search query
      } else if (iframe.includes("q=")) {
        const urlObj = new URL(iframe);
        name = urlObj.searchParams.get("q") || null;
      }

      maps.push({ iframe, name, latitude, longitude });
    });

    return maps;
  } catch (err) {
    console.error("Error scraping page:", err.message);
    return [];
  }
}

(async () => {
  const url = "https://bhanjyangtravels.com/";
  const results = await scrapeGoogleMaps(url);
  console.log(results);
})();
