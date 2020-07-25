import server from './app';

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
