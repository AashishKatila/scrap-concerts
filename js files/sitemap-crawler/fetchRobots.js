import fetch from "node-fetch";

async function fetchRobots(baseUrl) {
  const robotsUrl = new URL("/robots.txt", baseUrl).href;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  try {
    const res = await fetch(robotsUrl, {
      headers,
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`[robots.txt] Not found at ${res.url}`);
      return null;
    }

    console.log(`[robots.txt] Found at ${res.url}`);
    const text = await res.text();
    if (!text.startsWith("User-agent:") && !text.includes("Sitemap:")) {
      console.log("[robots.txt] Not real content, skipping");
      return null;
    }
    return text;
  } catch (err) {
    console.error(`[robots.txt] Error fetching:`, err.message);
    return null;
  }
}

function extractSitemapsFromRobots(robotsText) {
  const sitemaps = [];
  const lines = robotsText.split("\n");

  for (let line of lines) {
    console.log("Line = ", line);
    line = line.trim();
    if (line.toLowerCase().startsWith("sitemap:")) {
      let urlPart = line.split(":")[1].trim();
      try {
        const sitemapUrl = new URL(urlPart, baseUrl).href;
        sitemaps.push(sitemapUrl);
      } catch (err) {
        console.warn("Invalid sitemap URL skipped:", urlPart);
      }
    }
  }

  return sitemaps;
}

export { fetchRobots, extractSitemapsFromRobots };
