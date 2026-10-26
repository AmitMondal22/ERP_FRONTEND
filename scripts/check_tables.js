const connect = require('../DBConfig/db');

async function check() {
  let conn;
  try {
    conn = await connect();
    const [t1] = await conn.execute("SHOW COLUMNS FROM td_contractor_team_bom_assignment");
    console.log("td_contractor_team_bom_assignment columns:", t1.map(c => c.Field));
    const [t2] = await conn.execute("SHOW COLUMNS FROM td_contractor_team_bom_items");
    console.log("td_contractor_team_bom_items columns:", t2.map(c => c.Field));
    const [t3] = await conn.execute("SHOW COLUMNS FROM md_project_work_description");
    console.log("md_project_work_description columns:", t3.map(c => c.Field));
    const [workDescs] = await conn.execute("SELECT * FROM md_project_work_description LIMIT 5");
    console.log("Sample work descriptions:", workDescs);
  } catch (err) {
    console.error("Check error:", err);
  } finally {
    if (conn) await conn.end();
  }
}

check();
