const puppeteer = require("puppeteer");
const fs = require("fs");

type EventItem = {
  title: string;
  location: string;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto("https://www.ticketmaster.com/discover/concerts", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  const dropdownButton =
    "#main-content > div.sc-6fe63017-2.dSPkaY > div.sc-6fe63017-1.dIVcbK > div > button";
  const dropdownList = "#\\:Radam\\:";

  await page.waitForSelector(dropdownButton);

  const allItems: { title: string; location: string; genre: string }[] = [];

  await page.click(dropdownButton);
  await page.waitForSelector(dropdownList);

  for (let i = 1; i <= 12; i++) {
    const itemSelector = `#\\:Radam\\: > li:nth-child(${i}) > a`;
    await page.waitForSelector(itemSelector);

    const genreName = await page.$eval(itemSelector, (el: HTMLElement) =>
      el.textContent.trim()
    );

    await page.click(itemSelector);
    console.log(`\nScraping genre: ${genreName}`);

    await page.waitForSelector("#pageInfo ul > li");
    await new Promise((r) => setTimeout(r, 2000));

    let pageNum = 1;
    const maxItemsPerGenre = 800;
    const genreItems: { title: string; location: string }[] = [];

    while (true) {
      console.log(`Scraping page ${pageNum} of ${genreName}...`);

      const items = await page.$$eval(
        "#pageInfo ul > li",
        (lis: HTMLElement[]) =>
          lis
            .map((li: HTMLElement) => {
              const titleSpan = li.querySelector("span.sc-5b28b922-6.bUFsSQ");
              const locationSpan = li.querySelector(
                "span.sc-5b28b922-8.fVxPaT"
              );
              if (!titleSpan) return null;
              return {
                title: titleSpan.textContent.trim(),
                location: locationSpan ? locationSpan.textContent.trim() : "",
              };
            })
            .filter(Boolean)
      );

      items.forEach((item: EventItem) => {
        if (
          !genreItems.find(
            (i) => i.title === item.title && i.location === item.location
          )
        ) {
          genreItems.push(item);
          allItems.push({ ...item, genre: genreName });
        }
      });

      console.log(
        `Total items collected so far: ${allItems.length} (this genre: ${genreItems.length})`
      );

      if (genreItems.length >= maxItemsPerGenre) {
        console.log(
          `Reached ${maxItemsPerGenre} items for ${genreName}, moving to next genre.`
        );
        break;
      }

      const nextButton = await page.$(
        "#pageInfo button.PillButton__StyledPillButton-sc-16g7y5v-0"
      );

      if (!nextButton) {
        console.log(
          "No More Events button found. Stopping pagination for this genre."
        );
        break;
      }

      const isDisabled = await nextButton.evaluate((btn: HTMLElement) =>
        btn.hasAttribute("disabled")
      );
      if (isDisabled) {
        console.log(
          "Next button disabled. Stopping pagination for this genre."
        );
        break;
      }

      const previousCount = await page.$$eval(
        "#pageInfo ul > li",
        (lis: HTMLElement[]) => lis.length
      );
      await nextButton.click();

      try {
        await page.waitForFunction(
          (selector: string, previousCount: number) =>
            document.querySelectorAll(selector).length > previousCount,
          { timeout: 15000 },
          "#pageInfo ul > li",
          previousCount
        );
      } catch {
        console.log("No new items loaded. Ending pagination for this genre.");
        break;
      }

      pageNum++;
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (i < 12) {
      await page.click(dropdownButton);
      await page.waitForSelector(dropdownList);
    }
  }

  fs.writeFileSync("concerts.json", JSON.stringify(allItems, null, 2));
  console.log(`\nScraping finished. Total items collected: ${allItems.length}`);

  await browser.close();
})();
