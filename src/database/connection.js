// @file src/db/connection.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: mysql_data.host,
    port: Number(mysql_data.port || 3306),
    user: mysql_data.username,
    password: mysql_data.password,
    database: mysql_data.database,
    connectionLimit: Number(
        mysql_data.pool?.connection_limit || 10
    ),
    waitForConnections: true,
    enableKeepAlive: true,
    timezone: mysql_data.timezone || "Asia/Jakarta",
    charset: "utf8mb4"
});

export default pool;