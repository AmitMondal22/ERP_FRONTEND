// scheduler/payrollScheduler.js (like your solarman example)
const cron = require('node-cron');
const { generateAllMonthlyPayslipsService } = require('../services/payrollService');

const startScheduler = () => {
  // 1st day of month at 01:00 IST[web:6][web:13]
  cron.schedule('0 1 1 * *', async () => {
    console.log(`\n[${new Date().toISOString()}] 🧾 Triggering Monthly Payslip Generation...`);
    const result = await generateAllMonthlyPayslipsService(null); // system user
    console.log('✅ Payslip summary:', result.summary);
  }, { timezone: 'Asia/Kolkata' });

  console.log('✅ Scheduler started: Monthly Payslips (1st 01:00 IST)');
};

module.exports = startScheduler;
