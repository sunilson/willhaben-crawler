import {getProperty, navigateToPage, setupBrowser} from './puppeteerHelpers';
import {Page} from 'puppeteer';
import {SearchQuery} from '../models/SearchQuery';
import {Product} from '../models/Product';
import CrawlerService from './crawlerService';

/*
This file contains everything that is needed for the crawling of Willhaben. Here, products are extracted
and emails are sent out.
 */

/**
 * Goes to willhaben with the given category and search query, extracts all products, stores them and sends out an email
 * if the product is new.
 *
 * @param page
 * @param query SearchQuery object containing the keyword and category
 */
async function extractData(page: Page, query: SearchQuery) {
  //await selectOptionAtIndex(page, '.rows-per-page', 2);

  let url = `https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz`;

  if (!query.category) {
    url = `https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz${query.shippingRequired &&
      '/a/uebergabe-versand-2537'}?rows=15&keyword=${query.keyword}`;
  } else {
    url = `https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz/${query.category}${query.shippingRequired &&
      '/a/uebergabe-versand-2537'}?rows=15&keyword=${query.keyword}`;
  }

  if (query.minPrice || query.maxPrice) {
    url = `${url}&PRICE_FROM=${query.minPrice ? query.minPrice : ''}&PRICE_TO=${query.maxPrice ? query.maxPrice : ''}`;
  }

  console.log('Navigating to ' + url);

  await navigateToPage(page, url);

  const articles = await page.$$('[itemType="http://schema.org/Product"]');
  const results: Product[] = [];
  for (let article of articles) {
    //Get all details for the products
    const description = (await getProperty(page, 'textContent', '.description', article)).trim();
    const title = (await getProperty(page, 'textContent', '[itemprop="name"]', article)).trim();
    const url = await getProperty(page, 'href', 'a', article);
    const image = await getProperty(page, 'src', 'img', article);
    const priceElement = (await getProperty(page, 'textContent', '.info-2-price', article)).match(/[.\d]+/g);
    let price = '';
    if (priceElement) price = priceElement[0];
    const hash = CrawlerService.generateHashFromUrl(url);

    const product: Product = {
      title,
      image,
      url,
      price,
      description,
      id: hash,
    };

    const previousExists = await CrawlerService.checkIfProductExists(hash);

    //Only send emails for new products
    if (!previousExists) {
      await CrawlerService.storeProduct(product);
      results.push(product);
    }
  }

  if (results.length === 0) return;

  console.log(`Got ${results.length} new products! Now sending mail...`);

  //Send the email about new products
  await CrawlerService.sendMail({
    from: 'scraper@linus.com',
    to: 'weisslinus@gmail.com',
    subject: `${results.length} new entries for ${query.category}-${query.keyword}`,
    html: CrawlerService.generateMailBody(results, query),
  });

  await page.close();
}

export default async function startRun(queries: SearchQuery[]) {
  console.log('Starting new run...');
  const [browser, page] = await setupBrowser();
  try {
    await navigateToPage(page, `https://www.willhaben.at`);

    const extractions: Promise<any>[] = [];
    for (let query of queries) {
      const queryPage = await browser.newPage();
      extractions.push(extractData(queryPage, query));
    }
    await Promise.all(extractions);

    await page.close();
    await browser.close();
    console.log('Finished run!');
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
  }
}
