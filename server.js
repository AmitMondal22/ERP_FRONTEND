const cluster = require('cluster');
const os = require('os');
const app = require('./app');

// Configuration
const PORT = process.env.PORT || 3300;
const WORKERS = process.env.WEB_CONCURRENCY || os.cpus().length;
const isDev = process.env.NODE_ENV !== 'production';

// Enhanced clustering with graceful shutdown
if (cluster.isMaster) {
  const numCPUs = WORKERS;
  
  console.log(`Master ${process.pid} starting with ${numCPUs} workers`);
  console.log(`CPU cores available: ${os.cpus().length}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Create workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.log(`Worker ${worker.process.pid} spawned`);
  }

  // Handle worker exits with detailed logging
  cluster.on('exit', (worker, code, signal) => {
    const exitCode = worker.process.exitCode;
    console.log(`Worker ${worker.process.pid} died (${signal || exitCode})`);
    
    if (!worker.exitedAfterDisconnect) {
      console.log('Starting replacement worker...');
      const newWorker = cluster.fork();
      console.log(`New worker ${newWorker.process.pid} started`);
    }
  });

  // Graceful shutdown handling
  process.on('SIGINT', () => {
    console.log('\nMaster received SIGINT, shutting down gracefully...');
    
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    
    setTimeout(() => {
      console.log('Force killing remaining workers...');
      process.exit(0);
    }, 5000);
  });

  // Worker monitoring
  setInterval(() => {
    const workerCount = Object.keys(cluster.workers).length;
    if (workerCount < numCPUs) {
      console.log(`Worker shortage detected (${workerCount}/${numCPUs})`);
    }
  }, 30000);

} else {
  // Worker process
  const server = app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });

  // Graceful shutdown for workers
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} received SIGTERM, closing server...`);
    
    server.close(() => {
      console.log(`Worker ${process.pid} HTTP server closed`);
      process.exit(0);
    });
    
    setTimeout(() => {
      console.log(`Worker ${process.pid} force exit`);
      process.exit(1);
    }, 5000);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`Worker ${process.pid} uncaught exception:`, err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Worker ${process.pid} unhandled rejection at:`, promise, 'reason:', reason);
    process.exit(1);
  });
}
