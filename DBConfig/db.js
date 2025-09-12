const mysql = require("mysql2/promise");

async function connect() {

  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "erp_pg_application",
  });
  
}

module.exports = connect;