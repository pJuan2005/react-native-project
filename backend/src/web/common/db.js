const mysql = require("mysql2");
const config = require("../../config/env");

const pool = mysql.createPool({
  host: config.DB.HOST || "127.0.0.1",
  port: config.DB.PORT || 3306,
  user: config.DB.USER || "root",
  password: config.DB.PASSWORD || "",
  database: config.DB.NAME || "homestay_db",
  dateStrings: true,
  timezone: "+07:00",
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  connectTimeout: 2000,
});

module.exports = pool;
