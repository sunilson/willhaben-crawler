import express, {NextFunction, Request, Response} from 'express';
import admin from 'firebase-admin';
import startRun from '../../crawler/crawler';
import {SearchQuery} from '../../models/SearchQuery';
import runSimpleCrawler from '../../crawler/simpleCrawler';

const crypto = require('crypto');
const router: express.Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Crawler request: ', Date.now());
  next();
});

async function getQueries(): Promise<SearchQuery[]> {
  const queries: SearchQuery[] = [];
  const entries = await admin
    .firestore()
    .collection('queries')
    .get();
  entries.forEach(entry => {
    const query = entry.data() as SearchQuery;
    if (!query.lastRefresh || new Date().getTime() - query.lastRefresh > query.refreshRate) {
      queries.push(query);
      setLastRefresh(entry.id);
    }
  });

  return queries;
}

async function setLastRefresh(id: string) {
  await admin
    .firestore()
    .doc(`queries/${id}`)
    .update({lastRefresh: new Date().getTime()});
}

/**
 * Start scraper
 */
router.get('/runFast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await runSimpleCrawler(await getQueries());
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
  res.sendStatus(200);
});

/**
 * Start the crawler and execute all queries
 */
router.get('/run', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await startRun(await getQueries());
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
  res.sendStatus(200);
});

/**
 * Create a new query that will be executed by the crawler
 */
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const {category, keyword, refreshRate} = req.body;
  if ((!category && !keyword) || (category.length == 0 && keyword.length == 0)) {
    return next(new Error('Either query or category must be given!'));
  }

  if (!refreshRate || isNaN(refreshRate)) {
    return next(new Error('Refresh rate must be given!'));
  }

  await admin
    .firestore()
    .collection('queries')
    .doc(generateHash(category, keyword))
    .set({
      category,
      keyword,
      refreshRate,
    });

  res.sendStatus(201);
});

/**
 * Hash query so we only store unique queries
 *
 * @param category
 * @param search
 */
function generateHash(category: string, search: string): string {
  return crypto
    .createHash('sha1')
    .update(category + '' + search)
    .digest('hex');
}

export default router;
