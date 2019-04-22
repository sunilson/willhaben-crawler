import request from 'request-promise';

import cheerio from 'cheerio';
import {Product} from '../models/Product';
import {SearchQuery} from '../models/SearchQuery';
import CrawlerService from './crawlerService';

const runSimpleCrawler = async (queries: SearchQuery[]) => {
  for (let query of queries) {
    const products: Product[] = [];
    const results: Product[] = [];
    let url = '';
    if (!query.category) {
      url = `https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz?rows=15&keyword=${query.keyword}`;
    } else {
      url = `https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz/${query.category}?rows=15&keyword=${
        query.keyword
      }`;
    }

    const result = await request(url);
    const $ = cheerio.load(result);

    const articles = $('.search-result-entry');

    articles.each(async function(i, element) {
      const description = $(this)
        .find('.description')
        .text()
        .trim();
      const title = $(this)
        .find('[itemprop="name"]')
        .text()
        .trim();
      let url = $(this)
        .find('a')
        .attr('href');
      const image = $(this)
        .find('img')
        .attr('src');

      if (url === undefined) return;
      url = 'https://www.willhaben.at/' + url;
      const hash = CrawlerService.generateHashFromUrl(url);

      const product: Product = {
        title,
        image,
        url,
        price: 'n.A.',
        description,
        id: hash,
      };

      products.push(product);
    });

    for (let product of products) {
      if (!product.id) continue;
      if (await CrawlerService.checkIfProductExists(product.id)) continue;
      await CrawlerService.storeProduct(product);
      results.push(product);
    }

    await CrawlerService.sendMail({
      from: 'scraper@linus.com',
      to: 'weisslinus@gmail.com',
      subject: `${results.length} new entries for ${query.category}-${query.keyword}`,
      html: CrawlerService.generateMailBody(results, query),
    });
  }
};

export default runSimpleCrawler;
