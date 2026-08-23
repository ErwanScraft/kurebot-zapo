// @file src/db/connection.js
import proccess from "mysql2/promise";

const pool = proccess.createPool({
  host: mysql.host,
  port: Number(mysql.port || 3306),
  user: mysql.username,
  password: mysql.password,
  database: mysql.database,
  connectionLimit: Number(mysql.pool.connection_limit || 10),
  waitForConnections: true,
  enableKeepAlive: true,
  timezone: mysql.timezone || "Asia/Jakarta",
  charset: "utf8mb4"
});

export default pool;