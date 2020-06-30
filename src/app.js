/* eslint-disable no-throw-literal */
/* eslint-disable camelcase */
const express = require('express');

const path = require('path');
const http = require('http');

// routers
const userRouter = require('./router/user');
const postRouter = require('./router/posts');
const miscRouter = require('./router/misc');
const settingRouter = require('./router/settings');
const multimediaRouter = require('./router/multimedia');
const trackRouter = require('./router/tracker');
const searchRouter = require('./router/search');

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

app.get('/', (req, res) => {
  res.send('Download app now');
});

module.exports = server;
