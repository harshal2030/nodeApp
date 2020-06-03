const cluster = require('cluster');
const os = require('os');

console.log('hii');
const server = require('./app');

const port = process.env.PORT;

const workerClusterSize = os.cpus().length;

if (workerClusterSize > 1) {
  if (cluster.isMaster) {
    for (let i = 0; i < workerClusterSize; i += 1) {
      cluster.fork();
    }

    cluster.on('exit', () => {
      cluster.fork();
    });
  } else {
    server.listen(port, '192.168.43.25', () => {
      console.log(`server listening on port ${port} and worker ${process.pid}`);
    });
  }
} else {
  server.listen(port, '192.168.43.25', () => {
    console.log('Server listening on ', +port);
  });
}
