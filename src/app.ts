/* eslint-disable no-throw-literal */
/* eslint-disable camelcase */
import express, { Request, Response } from 'express';

import path from 'path';
import http from 'http';

// routers
import userRouter from './router/user';
import postRouter from './router/posts';
import miscRouter from './router/misc';
import settingRouter from './router/settings';
import multimediaRouter from './router/multimedia';
import trackRouter from './router/tracker';
import searchRouter from './router/search';

const app = express();
const server = http.createServer(app);

const publicDirPath = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirPath));

app.use(userRouter);
app.use(postRouter);
app.use(multimediaRouter);
app.use(searchRouter);
app.use(miscRouter);
app.use(settingRouter);
app.use(trackRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Download app now');
});

export { server }
