// ============================================================
//  API LOGGER — INSPECTION ONLY
//  Purpose : Log every incoming HTTP request so you can see
//            exactly which API endpoint is being hit, how
//            often, and whether it succeeded or crashed the
//            server.
//
//  HOW TO REMOVE AFTER TESTING:
//    1. Delete this file  (server/middleware/apiLogger.js)
//    2. Remove this ONE line from server/app.js:
//           app.use(apiLogger);
//    3. Remove the require() line from server/app.js:
//           const apiLogger = require('./middleware/apiLogger');
//
//  OUTPUT FORMAT (PM2 out.log / terminal):
//    [API] 12:45:01 | --> GET  /api/projects          | IP: 192.168.1.5
//    [API] 12:45:01 | <-- GET  /api/projects          | 200 | 43ms
//    [API] 12:45:01 | <-- GET  /api/projects          | 500 | 102ms  ← CRASH
//    [API] 12:45:01 | LOOP DETECTED: GET /api/projects hit 15 times in 10s
// ============================================================

const hitTracker = {}; // { "METHOD /path": { count, windowStart } }

const LOOP_THRESHOLD = 10;      // how many hits in one window = suspicious
const LOOP_WINDOW_MS = 10000;   // 10-second rolling window

function formatTime(date) {
  return date.toTimeString().slice(0, 8); // HH:MM:SS
}

function trackAndWarnLoop(key) {
  const now = Date.now();
  if (!hitTracker[key]) {
    hitTracker[key] = { count: 1, windowStart: now };
    return;
  }

  const entry = hitTracker[key];
  const elapsed = now - entry.windowStart;

  if (elapsed > LOOP_WINDOW_MS) {
    // Reset window
    entry.count = 1;
    entry.windowStart = now;
  } else {
    entry.count++;
    if (entry.count === LOOP_THRESHOLD) {
      console.warn(
        `\n⚠️  [API-LOGGER] LOOP DETECTED: "${key}" has been hit ${entry.count} times in ${(elapsed / 1000).toFixed(1)}s — possible React useEffect loop!\n`
      );
    }
  }
}

function apiLogger(req, res, next) {
  const start = Date.now();
  const time = formatTime(new Date());
  const method = req.method.padEnd(6);
  const url = req.originalUrl;
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const key = `${req.method} ${url.split('?')[0]}`; // path only, no query string

  // Log the incoming request
  console.log(`[API] ${time} | --> ${method} ${url.padEnd(55)} | IP: ${ip}`);

  // Track for loop detection
  trackAndWarnLoop(key);

  // Intercept the response to log the result
  const originalSend = res.send.bind(res);
  res.send = function (body) {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const icon = status >= 500 ? '💥' : status >= 400 ? '⚠️ ' : '✅';

    console.log(`[API] ${time} | <-- ${method} ${url.padEnd(55)} | ${icon} ${status} | ${ms}ms`);

    return originalSend(body);
  };

  next();
}

module.exports = apiLogger;
