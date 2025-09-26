import fs from "fs";
import { Impit } from "impit";

const impit = new Impit({ browser: "chrome" });

// Random delay function between 1-3 seconds
function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const filePath = "events-by-date.json";

// Load existing events if file exists
let allEvents = [];
if (fs.existsSync(filePath)) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    allEvents = JSON.parse(data);
  } catch (err) {
    console.error("Error reading existing events file:", err);
    allEvents = [];
  }
}

// Set your cookies here
const cookies =
  "BID=cHdXOPCtFb3us0Zx8MRDv9KfhlPfxPmp48vjGdz3Dw3r8gErYGFJVgOaZZF7OXmp829CvKtkQAnYNSq5; eps_sid=02adca736f73526dd4c2faa262f40bb87536ac3b; _gcl_au=1.1.401656571.1758437390; _au_1d=AU1D0200001758437391R9GVEPP6KRGU; _ga=GA1.1.478433293.1758437391; OptanonGroups=,C0001,; ndcd=wc1.1.w-729460.1.2.Z3YrytJiqj9N4VvRw0kzeg%252C%252C.O-TfXuBsQseO9TsV3V4sx0DPV9X_XzlrhjiqUcTdZin8WFkcOXWcsEmysG59QgBIVVmt0i0r5khc6B3lKNP7pVa83eHtCFqBWIviJPtPPwb1CJzs4gqmAqKZICwX3P-bZQXS4XjIhBgvbPJjld76f5KVowuIOM4Zguxw-LggKs-8dApya4YcDD7LExjI6VMc; tk-u=MDQ5NmIyODMtNjM2NC00ZmRmLTk0NTEtOTJjY2NiNzFhZDA1; tk-api-email=d29yay5hYXNoaXNoMGthdGlsYUBnbWFpbC5jb20; tk-api-key=WyI1RTgxUHFvVDZvR0NvT2pHVUdyZzB3dVpsVFh4TEh1MiJd; tk-api-apps=W3sibmFtZSI6IkFhc2hpc2hLYXRpbGEtQXBwIiwiY3JlYXRlZCI6IjIwMjUtMDktMjIgMDY6NTIgQU0iLCJrZXkiOiI1RTgxUHFvVDZvR0NvT2pHVUdyZzB3dVpsVFh4TEh1MiJ9XQ; tk-user-roles=WyJhdXRoZW50aWNhdGVkIHVzZXIiXQ; SSESSba67f03972f55553598b0a8abebb2c0d=bG696YTUqgJQdFqGLV8vo35KzfIvLw6h__RQ5uYDHS4; LANGUAGE=en-us; SID=hQ25OW6xxmWzrSuoGxs4ub3Svb54neUa7CX5601unHr-4O-b1QdE6sSgS3Vmdt5qU3ip8dsDQVfH82ME; NDMA=200; TMUO=east_gW5hVawjZawrUjT6e43EBvqJtQqtePaWzYWOv+EooZ0=; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Sep+22+2025+20%3A23%3A10+GMT%2B0545+(Nepal+Time)&version=202506.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=4469dbd4-1f97-4e11-aa76-78fe48aa0aaa&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A0%2CC0002%3A0%2CC0004%3A0&AwaitingReconsent=false; tmp_id=ced119cff5b62caa40e8bda613d90155bf0b2288e7623d08bfb78b6a00faafd8; _ga_C1T806G4DF=GS2.1.s1758551891$o13$g0$t1758551891$j60$l0$h0; _ga_H1KKSGW33X=GS2.1.s1758551891$o14$g0$t1758551891$j60$l0$h0";

// Define the date ranges to fetch
const dateRanges = [
  { start: "2025-01-01", end: "2025-03-31" },
  { start: "2025-04-01", end: "2025-06-31" },
  { start: "2025-07-01", end: "2025-09-31" },
  { start: "2025-10-01", end: "2025-10-10" },
  { start: "2025-10-11", end: "2025-10-20" },
  { start: "2025-10-21", end: "2025-10-31" },
  { start: "2025-11-01", end: "2025-11-31" },
  { start: "2025-12-01", end: "2025-12-10" },
  { start: "2025-12-11", end: "2025-12-20" },
  { start: "2025-12-21", end: "2025-12-31" },
  // Add more ranges as needed
];

(async () => {
  for (const range of dateRanges) {
    console.log(`Fetching events from ${range.start} to ${range.end}`);

    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://www.ticketmaster.com/api/search/events/category/KZFzniwnSyZfZ7v7nJ?startDate=${range.start}&endDate=${range.end}&page=${page}&region=200`;

      try {
        const response = await impit.fetch(url, {
          method: "GET",
          headers: {
            Accept: "*/*",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            Referer: "https://www.ticketmaster.com/discover/concerts",
            "x-tmclient-app": "marketplace_fe",
            "x-tmlangcode": "en-us",
            "x-tmplatform": "global",
            Cookie: cookies,
          },
        });

        if (response.status !== 200) {
          console.log(`Page ${page} failed with status:`, response.status);
          break; // Stop paging for this range if we hit 400
        }

        const json = await response.json();
        const events = json.events || [];

        console.log(`Page ${page}: fetched ${events.length} events`);
        allEvents.push(...events);

        // If less than 20 events returned, assume this is the last page
        if (events.length < 20) hasMore = false;
        else page++;

        // Random delay to avoid throttling
        await new Promise((res) => setTimeout(res, randomDelay()));
      } catch (err) {
        console.error(`Error fetching page ${page}:`, err);
        hasMore = false;
      }
    }
  }

  // Save all events to file
  fs.writeFileSync(filePath, JSON.stringify(allEvents, null, 2));
  console.log(`Saved ${allEvents.length} events to ${filePath}`);
})();
