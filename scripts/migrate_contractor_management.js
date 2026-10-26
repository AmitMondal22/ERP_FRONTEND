const connect = require('../DBConfig/db');

async function migrate() {
  let conn;
  try {
    conn = await connect();
    console.log("Connected to MySQL database: erp_pg_application");

    // 1. Create md_contractor_company table
    const createContractorCompanySql = `
      CREATE TABLE IF NOT EXISTS md_contractor_company (
        contractor_company_id INT(11) NOT NULL AUTO_INCREMENT,
        company_name VARCHAR(200) NOT NULL,
        vendor_id INT(11) DEFAULT NULL COMMENT 'Linked vendor if existing in md_vendor',
        contact_person VARCHAR(150) DEFAULT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(100) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        city_id INT(11) DEFAULT NULL,
        gst_no VARCHAR(25) DEFAULT NULL,
        pan_no VARCHAR(20) DEFAULT NULL,
        bank_name VARCHAR(100) DEFAULT NULL,
        bank_account_no VARCHAR(50) DEFAULT NULL,
        bank_ifsc VARCHAR(20) DEFAULT NULL,
        default_tds_percent DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT 'Default TDS % e.g. 1% for individual, 2% for company under 194C',
        status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
        remarks TEXT DEFAULT NULL,
        created_by INT(11) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (contractor_company_id),
        KEY idx_cc_vendor (vendor_id),
        KEY idx_cc_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await conn.execute(createContractorCompanySql);
    console.log("✓ Created/verified table: md_contractor_company");

    // Check if contractor_company_id column exists in md_contractor_team
    const [teamCols] = await conn.execute(`SHOW COLUMNS FROM md_contractor_team LIKE 'contractor_company_id'`);
    if (teamCols.length === 0) {
      await conn.execute(`
        ALTER TABLE md_contractor_team 
        ADD COLUMN contractor_company_id INT(11) DEFAULT NULL AFTER vendor_id,
        ADD KEY idx_team_company (contractor_company_id);
      `);
      console.log("✓ Added contractor_company_id column to md_contractor_team");
    }

    // Check if contractor_company_id column exists in md_contractual_employee
    const [empCols] = await conn.execute(`SHOW COLUMNS FROM md_contractual_employee LIKE 'contractor_company_id'`);
    if (empCols.length === 0) {
      await conn.execute(`
        ALTER TABLE md_contractual_employee 
        ADD COLUMN contractor_company_id INT(11) DEFAULT NULL AFTER vendor_id,
        ADD KEY idx_emp_company (contractor_company_id);
      `);
      console.log("✓ Added contractor_company_id column to md_contractual_employee");
    }

    // 2. Create td_contractor_team_bom_assignment (Master for Work Allocation to a Team)
    const createBomAssignmentSql = `
      CREATE TABLE IF NOT EXISTS td_contractor_team_bom_assignment (
        assignment_id INT(11) NOT NULL AUTO_INCREMENT,
        assignment_code VARCHAR(50) NOT NULL UNIQUE,
        contractor_company_id INT(11) NOT NULL,
        contractor_team_id INT(11) NOT NULL,
        project_id INT(11) NOT NULL,
        site_id INT(11) NOT NULL,
        assignment_date DATE NOT NULL,
        target_completion_date DATE DEFAULT NULL,
        total_work_descriptions INT(11) NOT NULL DEFAULT 0,
        total_boms INT(11) NOT NULL DEFAULT 0,
        total_assigned_qty DECIMAL(14,3) NOT NULL DEFAULT 0.000,
        grand_total_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Sum of all assigned Work Description amounts',
        status ENUM('ALLOCATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ALLOCATED',
        remarks TEXT DEFAULT NULL,
        created_by INT(11) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (assignment_id),
        KEY idx_bom_assign_company (contractor_company_id),
        KEY idx_bom_assign_team (contractor_team_id),
        KEY idx_bom_assign_proj (project_id),
        KEY idx_bom_assign_site (site_id),
        KEY idx_bom_assign_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await conn.execute(createBomAssignmentSql);
    console.log("✓ Created/verified table: td_contractor_team_bom_assignment");

    // 3. Create td_contractor_team_bom_items (Details of Work Descriptions, Quantity, Rate, Amount assigned to Team)
    const createBomItemsSql = `
      CREATE TABLE IF NOT EXISTS td_contractor_team_bom_items (
        assignment_item_id INT(11) NOT NULL AUTO_INCREMENT,
        assignment_id INT(11) NOT NULL,
        project_work_description_id INT(11) DEFAULT NULL,
        bom_id INT(11) DEFAULT NULL,
        assigned_qty DECIMAL(12,3) NOT NULL,
        unit VARCHAR(50) DEFAULT NULL,
        unit_rate DECIMAL(15,2) NOT NULL COMMENT 'Amount / rate per unit for this Work Description',
        total_cost DECIMAL(15,2) NOT NULL COMMENT 'assigned_qty * unit_rate',
        completed_qty DECIMAL(12,3) NOT NULL DEFAULT 0.000,
        remarks VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (assignment_item_id),
        KEY idx_bi_assignment (assignment_id),
        KEY idx_bi_work_desc (project_work_description_id),
        KEY idx_bi_bom (bom_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await conn.execute(createBomItemsSql);
    console.log("✓ Created/verified table: td_contractor_team_bom_items");

    // 4. Create td_contractor_advance_payment (Advance given to company/team, with TDS Tax deduction)
    const createAdvancePaymentSql = `
      CREATE TABLE IF NOT EXISTS td_contractor_advance_payment (
        advance_id INT(11) NOT NULL AUTO_INCREMENT,
        payment_voucher_no VARCHAR(50) NOT NULL UNIQUE,
        contractor_company_id INT(11) NOT NULL,
        contractor_team_id INT(11) NOT NULL,
        project_id INT(11) NOT NULL,
        site_id INT(11) NOT NULL,
        assignment_id INT(11) DEFAULT NULL COMMENT 'Optional link to specific BOM work order',
        payment_date DATE NOT NULL,
        work_description TEXT DEFAULT NULL COMMENT 'Purpose or work description for advance',
        gross_amount DECIMAL(15,2) NOT NULL COMMENT 'Gross advance sanctioned amount',
        tds_section VARCHAR(30) DEFAULT '194C' COMMENT 'Tax section e.g. 194C for contractors',
        tds_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'TDS tax percentage',
        tds_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'TDS tax cut amount',
        other_deduction_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        net_paid_amount DECIMAL(15,2) NOT NULL COMMENT 'gross_amount - tds_amount - other_deduction_amount',
        payment_mode ENUM('BANK_TRANSFER', 'NEFT_RTGS', 'CHEQUE', 'UPI', 'CASH') NOT NULL DEFAULT 'BANK_TRANSFER',
        transaction_reference VARCHAR(100) DEFAULT NULL COMMENT 'UTR / Cheque number',
        bank_name VARCHAR(100) DEFAULT NULL,
        payment_status ENUM('PAID', 'PENDING', 'CANCELLED') NOT NULL DEFAULT 'PAID',
        receipt_attachment VARCHAR(255) DEFAULT NULL,
        remarks TEXT DEFAULT NULL,
        created_by INT(11) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (advance_id),
        KEY idx_adv_company (contractor_company_id),
        KEY idx_adv_team (contractor_team_id),
        KEY idx_adv_proj (project_id),
        KEY idx_adv_site (site_id),
        KEY idx_adv_assign (assignment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await conn.execute(createAdvancePaymentSql);
    console.log("✓ Created/verified table: td_contractor_advance_payment");

    // 5. Create td_contractor_damage_penalty (Machinery, tool, material damage deduction)
    const createDamagePenaltySql = `
      CREATE TABLE IF NOT EXISTS td_contractor_damage_penalty (
        damage_id INT(11) NOT NULL AUTO_INCREMENT,
        incident_code VARCHAR(50) NOT NULL UNIQUE,
        contractor_company_id INT(11) NOT NULL,
        contractor_team_id INT(11) NOT NULL,
        contractual_employee_id INT(11) DEFAULT NULL COMMENT 'Optional employee responsible',
        project_id INT(11) NOT NULL,
        site_id INT(11) NOT NULL,
        incident_date DATE NOT NULL,
        item_type ENUM('MACHINE', 'EQUIPMENT', 'VEHICLE', 'MATERIAL', 'INFRASTRUCTURE', 'OTHER') NOT NULL DEFAULT 'MACHINE',
        item_name VARCHAR(150) NOT NULL COMMENT 'Name/Model of damaged machine or tool',
        damage_severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
        damage_description TEXT NOT NULL COMMENT 'Circumstances and nature of damage caused',
        repair_estimated_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Estimated total damage/repair cost',
        deductible_penalty_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Amount to be charged/deducted from contractor',
        recovery_status ENUM('PENDING', 'DEDUCTED_FROM_ADVANCE', 'DEDUCTED_FROM_BILL', 'REPAIRED_BY_CONTRACTOR', 'WAIVED') NOT NULL DEFAULT 'PENDING',
        evidence_photo_1 VARCHAR(255) DEFAULT NULL,
        evidence_photo_2 VARCHAR(255) DEFAULT NULL,
        investigated_by VARCHAR(100) DEFAULT NULL,
        approval_status ENUM('DRAFT', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
        remarks TEXT DEFAULT NULL,
        created_by INT(11) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (damage_id),
        KEY idx_dmg_company (contractor_company_id),
        KEY idx_dmg_team (contractor_team_id),
        KEY idx_dmg_emp (contractual_employee_id),
        KEY idx_dmg_proj (project_id),
        KEY idx_dmg_site (site_id),
        KEY idx_dmg_status (recovery_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await conn.execute(createDamagePenaltySql);
    console.log("✓ Created/verified table: td_contractor_damage_penalty");

    // 6. Seed / Sync existing vendor record (vendor 12: Arijit Pawer) into md_contractor_company if empty
    const [existingCompanies] = await conn.execute(`SELECT COUNT(*) AS count FROM md_contractor_company`);
    if (existingCompanies[0].count === 0) {
      const [contractorVendors] = await conn.execute(`
        SELECT * FROM md_vendor WHERE vendor_id = 12 OR vendor_name LIKE '%Pawer%' OR vendor_name LIKE '%Blitz%'
      `);
      for (const v of contractorVendors) {
        const [insertRes] = await conn.execute(`
          INSERT INTO md_contractor_company (
            company_name, vendor_id, contact_person, mobile, email, address, city_id, gst_no, default_tds_percent, status, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
        `, [
          v.vendor_name,
          v.vendor_id,
          v.vendor_name,
          v.vendor_mobile || '9999999999',
          v.vendor_email || null,
          v.vendor_address || null,
          v.city_id || null,
          v.vendor_gst_in || null,
          1.00,
          v.created_by || 5
        ]);
        const newCompanyId = insertRes.insertId;
        console.log(`✓ Seeded company from vendor #${v.vendor_id} -> contractor_company_id #${newCompanyId}`);

        // Link teams that had this vendor_id
        await conn.execute(`
          UPDATE md_contractor_team SET contractor_company_id = ? WHERE vendor_id = ?
        `, [newCompanyId, v.vendor_id]);

        // Link contractual employees that had this vendor_id
        await conn.execute(`
          UPDATE md_contractual_employee SET contractor_company_id = ? WHERE vendor_id = ?
        `, [newCompanyId, v.vendor_id]);
      }
    }

    console.log("\nALL TABLES CREATED AND DATA SYNCHRONIZED SUCCESSFULLY!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
