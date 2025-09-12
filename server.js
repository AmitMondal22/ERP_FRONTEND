const cluster = require('cluster');
const os = require('os');
const app = require('./app');


const PORT = process.env.PORT || 3300;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  console.log(`Master ${process.pid} is running on ${numCPUs} cores`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
}
