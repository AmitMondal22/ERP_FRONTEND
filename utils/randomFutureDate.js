const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

// Function to generate random future date 1-2 hours from now in IST
const randomFutureDateIST = () => {
  // Current time in IST
  const now = dayjs().tz("Asia/Kolkata");
  
  // 1 hour in ms = 3600000, 2 hours in ms = 7200000
  const minMs = 1 * 60 * 60 * 1000; // 1 hour
  const maxMs = 2 * 60 * 60 * 1000; // 2 hours

  const randomMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  const futureDate = now.add(randomMs, "millisecond");

  return futureDate.format("YYYY-MM-DD HH:mm:ss");
}

module.exports = randomFutureDateIST;
