const server = require('./app');

const port = process.env.PORT;

server.listen(port, '192.168.43.25', () => {
  console.log('Server listening on ', +port);
});
