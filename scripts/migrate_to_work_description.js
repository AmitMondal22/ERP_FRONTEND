const connect = require('../DBConfig/db');

async function migrate() {
  let conn;
  try {
    conn = await connect();
    console.log("Connected to MySQL database...");

    // 1. Alter td_contractor_team_bom_assignment to add total_work_descriptions
    const [assignCols] = await conn.execute(`SHOW COLUMNS FROM td_contractor_team_bom_assignment LIKE 'total_work_descriptions'`);
    if (assignCols.length === 0) {
      await conn.execute(`
        ALTER TABLE td_contractor_team_bom_assignment 
        ADD COLUMN total_work_descriptions INT(11) NOT NULL DEFAULT 0 AFTER target_completion_date;
      `);
      console.log("✓ Added total_work_descriptions column to td_contractor_team_bom_assignment");
    } else {
      console.log("✓ total_work_descriptions column already exists");
    }

    // 2. Alter td_contractor_team_bom_items: modify bom_id to be nullable, add project_work_description_id
    await conn.execute(`
      ALTER TABLE td_contractor_team_bom_items 
      MODIFY COLUMN bom_id INT(11) NULL DEFAULT NULL;
    `);
    console.log("✓ Made bom_id nullable in td_contractor_team_bom_items");

    const [itemCols] = await conn.execute(`SHOW COLUMNS FROM td_contractor_team_bom_items LIKE 'project_work_description_id'`);
    if (itemCols.length === 0) {
      await conn.execute(`
        ALTER TABLE td_contractor_team_bom_items 
        ADD COLUMN project_work_description_id INT(11) DEFAULT NULL AFTER assignment_id,
        ADD KEY idx_bi_work_desc (project_work_description_id);
      `);
      console.log("✓ Added project_work_description_id column to td_contractor_team_bom_items");
    } else {
      console.log("✓ project_work_description_id column already exists");
    }

    // Populate total_work_descriptions for existing rows if 0
    await conn.execute(`
      UPDATE td_contractor_team_bom_assignment 
      SET total_work_descriptions = total_boms 
      WHERE total_work_descriptions = 0 AND total_boms > 0;
    `);

    console.log("✓ Successfully applied work description assignment migration!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
