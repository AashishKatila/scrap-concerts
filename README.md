# Ticketmaster Concerts Web Scraper

This project uses **Puppeteer** and **TypeScript** to scrape concert event data from [Ticketmaster](https://www.ticketmaster.com/discover/concerts). It contains two scripts: one for scraping a single page and another for scraping multiple genres.

---

## Project Structure

```bash

├── index.ts # Scrapes a single page, collects ~970 events
├── scrap.ts # Scrapes events from multiple genres
├── package.json
├── tsconfig.json
└── concerts.json # Output file where scraped data is saved

```

---

## Features

### `index.ts`

- Scrapes event data from the main concerts page.
- Stops after collecting approximately **970 events**.
- Each event includes:
  - `title` – Name of the concert
  - `location` – Location of the concert

> ⚠️ Note: The limit (~970 events) may be due to browser rendering limitations or backend data restrictions.

### `scrap.ts`

- Scrapes events across multiple genres by selecting different dropdown items.
- Each event includes:
  - `title` – Name of the concert
  - `location` – Location of the concert
  - `genre` – Genre selected from the dropdown
- Collects a configurable number of items per genre (default: 80 items per genre in your current setup).

---

## Installation

1. Clone the repository:

```bash

git clone https://github.com/AashishKatila/scrap-concerts
cd scrap

```

2. Install dependencies:

```bash

npm install

```

## Usage

1. Scrape a single page:

```bash

npx ts-node index.ts

```

- Output will be saved to all-concerts.json.

2. Scrape multiple genres:

```bash

npx ts-node scrap.ts

```

- Output will be saved to concerts.json.
- Adjust the number of items per genre by modifying the maxItemsPerGenre variable in the code.

---
