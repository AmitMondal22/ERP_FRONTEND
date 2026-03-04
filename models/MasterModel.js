const connect = require("../DBConfig/db");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


// ---------- SELECT DATA ----------
async function selectData(table, select = "*", condition = null, orderBy = null) {
  let conn;

  try {
    let query = `SELECT ${select} FROM ${table}`;

    if (condition) query += ` WHERE ${condition}`;
    if (orderBy) query += ` ORDER BY ${orderBy}`;
    console.log(query);


    conn = await connect();
    const [rows] = await conn.execute(query);
    return rows;

  } catch (err) {
    console.error(err);
    throw err;
  } 
  finally {

    if (conn) await conn.end();
    
  }
};



async function selectOneData(table, select = "*", condition = null, orderBy = null) {
  let conn;
  try {
    let query = `SELECT ${select} FROM ${table}`;

    if (condition) query += ` WHERE ${condition}`;
    if (orderBy) query += ` ORDER BY ${orderBy}`;
    query += ` LIMIT 1`;
    //console.log(query)
    conn = await connect();

    //const [rows] = await conn.execute(query, values);
     const [rows] = await conn.execute(query); 
    return rows[0] || null;
  } catch (err) {
    console.error(err); 
    throw err;
  } finally {
    if (conn) await conn.end();
  }
} 



async function selectLastData(table, select = "*", condition = null, orderBy = null) {
  let conn;
  try {
    let query = `SELECT ${select} FROM ${table}`;
    if (condition) query += ` WHERE ${condition}`;
    if (orderBy) query += ` ORDER BY ${orderBy} DESC `;
    query +=`LIMIT 1`;
    conn = await connect();
    const [rows] = await conn.execute(query);
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}


// ---------- INSERT ----------
// async function insertData(table, columns, values) {
//   let conn;
//   try {
//     const placeholders = values.map(() => "?").join(",");

//     const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

//     conn = await connect();
//     const [result] = await conn.execute(query, values);
//     return result.insertId;
//   } catch (err) {
//     console.error(err);
//     throw err;
//   } finally {
//     if (conn) await conn.end();
//   }
// }



async function insertData(table, data) {
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data);
  const placeholders = values.map(() => "?").join(",");

  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  console.log(`INSERT INTO ${table} (${columns}) VALUES (${values})`)

  let conn;
  try {
    conn = await connect();
    const [result] = await conn.execute(query, values);

    return result.insertId;
    
  } catch (err) {
    console.error("Insert error:", err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
};
/**/ 


async function batchInsertData(table, columns, rows) {
  let conn;
  try {
    const placeholders = rows.map(
      (row) => `(${Object.keys(row).map(() => "?").join(",")})`
    ).join(",");

    const values = rows.flatMap((row) => Object.values(row));
    const query = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`;

    conn = await connect();
    const [result] = await conn.execute(query, values);
    return result.insertId; // first ID (auto_increment)
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}



// ---------- DELETE ----------
async function deleteData(table, condition) {

  let conn;
  try {
    const query = `DELETE FROM ${table} WHERE ${condition}`;
    conn = await connect();
    const [result] = await conn.execute(query);
    return result.affectedRows;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}


async function deleteInsertRestore(originalTable, backupTable, condition) {
  let conn;
  try {
    conn = await connect();
    await conn.beginTransaction();

    const insertQuery = `INSERT INTO ${backupTable} SELECT * FROM ${originalTable} WHERE ${condition}`;
    await conn.execute(insertQuery);

    const deleteQuery = `DELETE FROM ${originalTable} WHERE ${condition}`;
    await conn.execute(deleteQuery);

    await conn.commit();
    return true;
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    return false;
  } finally {
    if (conn) await conn.end();
  }
}

// ---------- UPDATE ----------
async function updateData(table, setValues, condition) {
  let conn;
  try {
    const keys = Object.keys(setValues);
    const setClause = keys.map((key) => `\`${key}\` = ?`).join(", ");
    const query = `UPDATE ${table} SET ${setClause} WHERE ${condition}`;
    console.log('[query]',query)
    const values = Object.values(setValues);

    conn = await connect();
    const [result] = await conn.execute(query, values);
    return result.affectedRows;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}



// async function updateData(table, setValues, id) {
//   let conn;
//   try {
//     const keys = Object.keys(setValues);
//     const setClause = keys.map((key) => `\`${key}\` = ?`).join(", ");
//     const values = Object.values(setValues);

//     const query = `UPDATE ${table} SET ${setClause} WHERE unit_id = ?`;
//     values.push(id); // Add id for WHERE clause
//     console.log('[query]',query)
//     console.log('[values]',values)
//     conn = await connect();
//     const [result] = await conn.execute(query, values);
//     return result.affectedRows;
//   } catch (err) {
//     console.error(err);
//     throw err;
//   } finally {
//     if (conn) await conn.end();
//   }
// }




// ---------- COUNT ----------


async function countRows(table, condition = "") {
  let conn;
  try {
    let query = `SELECT COUNT(*) AS count FROM ${table}`;
    if (condition) query += ` WHERE ${condition}`;

    conn = await connect();
    const [rows] = await conn.execute(query);
    return rows[0].count;
  } catch (err) {
    console.error(err);
    return -1;
  } finally {
    if (conn) await conn.end();
  }
}

// ---------- RANGE SELECT ----------
async function selectDataInRanges(select, table, start, end, condition = "") {
  let conn;
  try {
    let query = `SELECT ${select} FROM ${table}`;
    if (condition) query += ` WHERE ${condition}`;
    query += ` LIMIT ${end - start + 1} OFFSET ${start - 1}`;

    conn = await connect();
    const [rows] = await conn.execute(query);

    let totalQuery = `SELECT COUNT(*) AS count FROM ${table}`;
    if (condition) totalQuery += ` WHERE ${condition}`;
    const [total] = await conn.execute(totalQuery);

    return {
      total_count: total[0].count,
      row_data: rows,
      end_data: rows.length ? rows[rows.length - 1] : null,
      start,
      end,
    };
  } catch (err) {
    console.error(err);
    return null;
  } finally {
    if (conn) await conn.end();
  }
}


// ---------- CUSTOM QUERY ----------
async function customSelectSqlQuery(sql,fetchAll =true) {
  let conn;
  try {
    conn = await connect();
    const [rows] = await conn.execute(sql);
    return fetchAll ? rows : rows[0] || null;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) await conn.end(); 
  }
}


async function customSelectSqlQuery2(sql, params = [],fetchAll =true) {
  let conn;
  try {
    conn = await connect();
    const [rows] = await conn.execute(sql,params,);
    return fetchAll ? rows : rows[0] || null;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) await conn.end(); 
  }
}


// ---------- OPTIMIZED STOCK UPDATE (Single Query, No Loops) ----------



// async function updateStockQuantities(productUpdates, projectId, siteId) {
//   let conn;

//   try {
//     if (!Array.isArray(productUpdates) || productUpdates.length === 0) {
//       return 0;
//     }

//     const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

//     // ✅ Build CASE WHEN using Atc_total
//     const validItems = productUpdates.filter(
//       item =>
//         item.product_id &&
//         item.Atc_total !== undefined &&
//         Number(item.Atc_total) > 0
//     );

//     if (validItems.length === 0) {
//       return 0;
//     }

//     const caseWhen = validItems
//       .map(item => {
//         const qty = Number(item.Atc_total);
//         return `
//           WHEN product_id = ${item.product_id}
//            AND invoice_qty >= ${qty}
//            THEN invoice_qty - ${qty}
//         `;
//       })
//       .join(" ");

//     const productIds = validItems
//       .map(item => item.product_id)
//       .join(",");

//     const query = `
//       UPDATE tx_current_stock
//       SET
//         invoice_qty = CASE
//           ${caseWhen}
//           ELSE invoice_qty
//         END,
//         updated_at = '${now}'
//       WHERE project_id = ${projectId}
//         AND site_id = ${siteId}
//         AND product_id IN (${productIds})
//     `;

//     console.log("[STOCK UPDATE]", query);

//     conn = await connect();
//     const [result] = await conn.execute(query);

//     if (result.affectedRows === 0) {
//       throw new Error("Stock not updated (insufficient quantity or no matching rows)");
//     }

//     return result.affectedRows;

//   } catch (err) {
//     console.error("Stock update error:", err);
//     throw err;
//   } finally {
//     if (conn) await conn.end();
//   }
// }

async function updateStockQuantities(productUpdates, projectId, siteId) {
  let conn;

  try {
    if (!Array.isArray(productUpdates) || productUpdates.length === 0) {
      return 0;
    }

    const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    // ✅ Extract Act_Qty instead of Atc_total
    const validItems = productUpdates.filter(
      item =>
        item.product_id &&
        item.Act_Qty !== undefined &&
        Number(item.Act_Qty) > 0
    );

    if (validItems.length === 0) {
      return 0;
    }

    const caseWhen = validItems
      .map(item => {
        const qty = Number(item.Act_Qty); // CHANGED HERE
        return `
          WHEN product_id = ${item.product_id}
           AND invoice_qty >= ${qty}
           THEN invoice_qty - ${qty}
        `;
      })
      .join(" ");

    const productIds = validItems
      .map(item => item.product_id)
      .join(",");

    const query = `
      UPDATE tx_current_stock
      SET
        invoice_qty = CASE
          ${caseWhen}
          ELSE invoice_qty
        END,
        updated_at = '${now}'
      WHERE project_id = ${projectId}
        AND site_id = ${siteId}
        AND product_id IN (${productIds})
    `;

    console.log("[STOCK UPDATE]", query);

    conn = await connect();
    const [result] = await conn.execute(query);

    if (result.affectedRows === 0) {
      throw new Error("Stock not updated (insufficient quantity or no matching rows)");
    }

    return result.affectedRows;

  } catch (err) {
    console.error("Stock update error:", err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

module.exports = {
  selectData,
  selectOneData,
  selectLastData,
  insertData,
  batchInsertData,
  deleteData,
  updateStockQuantities,
  deleteInsertRestore,
  updateData,
  countRows,
  selectDataInRanges,
  customSelectSqlQuery,
  customSelectSqlQuery2
};