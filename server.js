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
  
  console.table({
    'Master PID': process.pid,
    'Workers': numCPUs,
    'CPU Cores': os.cpus().length,
    'Environment': process.env.NODE_ENV || 'development'
  });

  // Create workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.table({
      Event: 'Worker Spawned',
      'Worker PID': worker.process.pid
    });
  }

  // Handle worker exits with detailed logging
  cluster.on('exit', (worker, code, signal) => {
    const exitCode = worker.process.exitCode;
    console.table({
      Event: 'Worker Died',
      'Worker PID': worker.process.pid,
      'Signal': signal,
      'Exit Code': exitCode
    });
    
    if (!worker.exitedAfterDisconnect) {
      console.table({
        Event: 'Starting Replacement'
      });
      const newWorker = cluster.fork();
      console.table({
        Event: 'New Worker Started',
        'Worker PID': newWorker.process.pid
      });
    }
  });

  // Graceful shutdown handling
  process.on('SIGINT', () => {
    console.table({
      Event: 'Master SIGINT Received',
      Action: 'Shutting down gracefully...'
    });
    
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    
    setTimeout(() => {
      console.table({
        Event: 'Force Killing Workers',
        Timeout: '5 seconds'
      });
      process.exit(0);
    }, 5000);
  });

  // Worker monitoring
  setInterval(() => {
    const workerCount = Object.keys(cluster.workers).length;
    if (workerCount < numCPUs) {
      console.table({
        Event: 'Worker Shortage',
        Current: workerCount,
        Expected: numCPUs
      });
    }
  }, 30000);

} else {
  // Worker process
  const server = app.listen(PORT, () => {
    console.table({
      Event: 'Worker Listening',
      'Worker PID': process.pid,
      Port: PORT
    });
  });

  // Graceful shutdown for workers
  process.on('SIGTERM', () => {
    console.table({
      Event: 'Worker SIGTERM Received',
      'Worker PID': process.pid,
      Action: 'Closing server...'
    });
    
    server.close(() => {
      console.table({
        Event: 'HTTP Server Closed',
        'Worker PID': process.pid
      });
      process.exit(0);
    });
    
    setTimeout(() => {
      console.table({
        Event: 'Worker Force Exit',
        'Worker PID': process.pid,
        Timeout: '5 seconds'
      });
      process.exit(1);
    }, 5000);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`Worker ${process.pid} uncaught exception:`);
    console.table({
      Error: err.message,
      Stack: err.stack
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Worker ${process.pid} unhandled rejection at:`);
    console.table({
      Promise: promise,
      Reason: reason
    });
    process.exit(1);
  });
}