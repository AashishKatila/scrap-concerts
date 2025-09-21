const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  await page.goto("https://www.ticketmaster.com/discover/concerts", {
    waitUntil: "networkidle2",
  });

  const allItems: { title: string; location: string }[] = [];
  let pageNum = 1;
  const maxPages = 250;

  while (true) {
    console.log(`Scraping page ${pageNum}...`);

    const items = await page.$$eval("#pageInfo ul > li", (lis: any) =>
      lis
        .map((li: any) => {
          const titleSpan = li.querySelector("span.sc-5b28b922-6.bUFsSQ");
          const locationSpan = li.querySelector("span.sc-5b28b922-8.fVxPaT");
          if (!titleSpan) return null;

          return {
            title: titleSpan.textContent.trim(),
            location: locationSpan ? locationSpan.textContent.trim() : "",
          };
        })
        .filter(Boolean)
    );

    items.forEach((item: any) => {
      if (
        !allItems.find(
          (i) => i.title === item.title && i.location === item.location
        )
      ) {
        allItems.push(item);
      }
    });

    console.log(`Total items collected so far: ${allItems.length}`);

    if (pageNum >= maxPages) break;

    const nextButton = await page.$(
      "#pageInfo > div.sc-2443e9de-5.kfYIrw > div.sc-ccd40cff-0.fPIPJe > div > button"
    );

    if (!nextButton) {
      console.log("No Next button found. Stopping.");
      break;
    }

    const isDisabled = await nextButton.evaluate((btn: any) =>
      btn.hasAttribute("disabled")
    );
    if (isDisabled) {
      console.log("Next button is disabled. Stopping.");
      break;
    }

    const liCountBefore = await page.$$eval(
      "#pageInfo ul > li",
      (lis: any) => lis.length
    );

    await nextButton.click();

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 4000)
    );

    let newItemsLoaded = false;
    try {
      await page.waitForFunction(
        (selector: any, previousCount: any) =>
          document.querySelectorAll(selector).length > previousCount,
        { timeout: 15000 },
        "#pageInfo ul > li",
        liCountBefore
      );
      newItemsLoaded = true;
    } catch (err) {
      console.log("No new items loaded. Ending pagination.");
    }

    if (!newItemsLoaded) break;

    pageNum++;
  }

  console.log(`Scraping finished. Total items collected: ${allItems.length}`);

  fs.writeFileSync("concerts.json", JSON.stringify(allItems, null, 2));

  await browser.close();
})();
