const connect = require("../DBConfig/db");

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

async function updateData(table, setValues, condition) {
  let conn;
  try {
    const keys = Object.keys(setValues);

    const setClause = keys.map((key) => `\`${key}\` = ?`).join(", ");

    const query = `UPDATE ${table} SET ${setClause} WHERE ${condition}`;

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
async function customSelectSqlQuery(sql, fetchAll =true) {
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

module.exports = {
  selectData,
  selectOneData,
  selectLastData,
  insertData,
  batchInsertData,
  deleteData,
  deleteInsertRestore,
  updateData,
  countRows,
  selectDataInRanges,
  customSelectSqlQuery,
};