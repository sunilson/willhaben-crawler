import {Product} from '../models/Product';
import admin from 'firebase-admin';
import {SearchQuery} from '../models/SearchQuery';
const crypto = require('crypto');

const mailgun = require('mailgun-js')({
  apiKey: process.env.MAIL_GUN_API_KEY,
  domain: 'sandbox2d9db9bfc76b48449b62ff799071f072.mailgun.org',
});

type MailData = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

type CrawlerService = {
  sendMail: (mailData: MailData) => Promise<any>;
  storeProduct: (product: Product) => Promise<any>;
  checkIfProductExists: (id: string) => Promise<boolean>;
  generateMailBody: (products: Product[], query: SearchQuery) => string;
  generateHashFromUrl: (url: string) => string;
};

const CrawlerService: CrawlerService = {
  sendMail: async mailData => {
    await mailgun.messages().send(mailData);
  },
  storeProduct: async product => {
    await admin
      .firestore()
      .collection('products')
      .doc(product.id)
      .set(product);
  },
  checkIfProductExists: async id => {
    return (await admin
      .firestore()
      .collection('products')
      .doc(id)
      .get()).exists;
  },
  generateMailBody: (products: Product[], query: SearchQuery) => {
    console.log(`Generating mail body for ${products.length} products...`);
    const header = `<h1>Got ${products.length} new products for category ${query.category} with search ${
      query.keyword
    }</h1>`;
    let body = '';

    products.forEach(product => {
      body += `<div><img width="100" height="100" src="${product.image}"/><a href="${product.url}"><h2>${
        product.title
      } - ${product.price} €</h2></a><p>${product.description}</p></div>`;
    });

    return header + '' + body;
  },
  generateHashFromUrl: (url: string) => {
    return crypto
      .createHash('sha1')
      .update(url)
      .digest('hex');
  },
};

export default CrawlerService;
