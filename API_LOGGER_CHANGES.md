# API Logger — Change Log

> **Purpose:** Temporary inspection middleware to identify which API endpoint causes the server to crash.  
> **Status:** 🟡 ACTIVE — remove after testing is done.

---

## What Was Changed

### 1. NEW FILE CREATED
**`server/middleware/apiLogger.js`**

A standalone Express middleware file. It does **three things**:

| Feature | Description |
|---|---|
| **Request log** | Prints every incoming API hit: timestamp, method, full URL, caller IP |
| **Response log** | Prints the result after the response is sent: HTTP status code, time taken (ms) |
| **Loop detector** | If the same endpoint is hit **10+ times in 10 seconds**, prints a big `⚠️ LOOP DETECTED` warning |

No existing file was touched to create this.

---

### 2. TWO LINES ADDED to `server/app.js`

**Location:** Lines 87–88 (after the body parsers, before the first route)

```js
// ---- API LOGGER (inspection only — remove after testing) ----
const apiLogger = require('./middleware/apiLogger');
app.use(apiLogger);
// -------------------------------------------------------------
```

**Nothing else in `app.js` was changed.**

---

## What the Logs Look Like in PM2

```
[API] 12:45:01 | --> GET    /api/projects                              | IP: 192.168.1.5
[API] 12:45:01 | <-- GET    /api/projects                              | ✅ 200 | 43ms

[API] 12:45:02 | --> POST   /api/billing/add                           | IP: 192.168.1.5
[API] 12:45:03 | <-- POST   /api/billing/add                           | 💥 500 | 102ms  ← CRASH HERE

[API] 12:45:05 | --> GET    /api/units                                 | IP: 192.168.1.5
[API] 12:45:05 | --> GET    /api/units                                 | IP: 192.168.1.5
...
⚠️  [API-LOGGER] LOOP DETECTED: "GET /api/units" has been hit 10 times in 2.1s — possible React useEffect loop!
```

**Icons:**
- `✅` = success (2xx)
- `⚠️ ` = client error (4xx)
- `💥` = server crash (5xx)

---

## How to Read the Logs (PM2)

```bash
pm2 logs intraggioapi.iotblitz.in --lines 200
```

Look for:
- Any line with `💥 500` — that is the crashing endpoint
- Any `LOOP DETECTED` warning — that is a React infinite loop flooding that endpoint
- A single URL repeating every millisecond without stopping — same thing

---

## How to Remove After Testing

> [!IMPORTANT]  
> Do this in one go — 3 steps, then commit and push.

### Step 1 — Delete the logger file
```bash
rm server/middleware/apiLogger.js
```

### Step 2 — Remove 4 lines from `server/app.js`

Delete these lines (around line 87):
```js
// ---- API LOGGER (inspection only — remove after testing) ----
const apiLogger = require('./middleware/apiLogger');
app.use(apiLogger);
// -------------------------------------------------------------
```

### Step 3 — Commit and push
```bash
git -C server add middleware/apiLogger.js app.js
git -C server commit -m "chore: remove API inspection logger after testing"
git -C server push origin main
```

---

## Files Changed Summary

| File | Action | Lines Changed |
|---|---|---|
| `server/middleware/apiLogger.js` | ✅ **Created** (new file) | 70 lines |
| `server/app.js` | ✅ **2 lines added** (require + app.use) | +4 lines |

**Total files NOT changed:** Everything else — controllers, models, routes, `db.js`, `MasterModel.js`, etc. — untouched.
