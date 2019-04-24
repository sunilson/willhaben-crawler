import express, {NextFunction, Response, Request} from 'express';
import cors from 'cors';
import crawlers from './routes/crawlers';
import admin from 'firebase-admin';
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json')),
  databaseURL: 'https://willhaben-crawler.firebaseio.com',
});

//Init express
const app = express();
app.use(require('body-parser').json());
app.use(cors());

app.use('/crawler', crawlers);

/**
 * Error handling
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.send(err.message);
});

/**
 * 404 Error handling
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Route not found!');
  res.sendStatus(404);
});

//Start everything
app.listen(process.env.PORT || 4000, () => {
  console.log('Server running.');
});
