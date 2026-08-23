// @file src/db/query.js
import pool from "./connection.js";
import { schema } from "./schema.js";

const allowedTables = Object.keys(schema);

/**
 * INSERT DATA
 */
export const insertData = async (table, data) => {
  if (!allowedTables.includes(table)) {
    throw new Error(`Table ${table} tidak diizinkan`);
  }

  const keys = Object.keys(data);
  const placeholders = keys.map(() => "?").join(", ");

  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;

  const [result] = await pool.execute(sql, Object.values(data));

  return {
    insertId: result.insertId,
    affectedRows: result.affectedRows
  };
};

/**
 * GET DATA
 */
export const getData = async (table, conditions = {}, options = {}) => {
  if (!allowedTables.includes(table)) {
    throw new Error(`Table ${table} tidak diizinkan`);
  }

  let sql = `SELECT * FROM ${table}`;
  const values = [];

  if (Object.keys(conditions).length > 0) {
    const whereClause = Object.keys(conditions)
      .map(key => `${key} = ?`)
      .join(" AND ");
    sql += ` WHERE ${whereClause}`;
    values.push(...Object.values(conditions));
  }

  if (options.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }

  if (options.limit) {
    sql += ` LIMIT ${Number(options.limit)}`;
  }

  const [rows] = await pool.execute(sql, values);
  return rows;
};

/**
 * DELETE DATA
 */
export const deleteData = async (table, conditions = {}) => {
  if (!allowedTables.includes(table)) {
    throw new Error(`Table ${table} tidak diizinkan`);
  }

  if (Object.keys(conditions).length === 0) {
    throw new Error("Delete memerlukan kondisi");
  }

  const whereClause = Object.keys(conditions)
    .map(key => `${key} = ?`)
    .join(" AND ");

  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

  const [result] = await pool.execute(sql, Object.values(conditions));

  return {
    affectedRows: result.affectedRows
  };
};

/**
 * UPDATE DATA
 */
export const updateData = async (table, data = {}, conditions = {}) => {
  if (!allowedTables.includes(table)) {
    throw new Error(`Table ${table} tidak diizinkan`);
  }

  if (Object.keys(data).length === 0) {
    throw new Error("Update memerlukan data");
  }

  if (Object.keys(conditions).length === 0) {
    throw new Error("Update memerlukan kondisi");
  }

  const setClause = Object.keys(data)
    .map(key => `${key} = ?`)
    .join(", ");

  const whereClause = Object.keys(conditions)
    .map(key => `${key} = ?`)
    .join(" AND ");

  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

  const values = [
    ...Object.values(data),
    ...Object.values(conditions)
  ];

  const [result] = await pool.execute(sql, values);

  return {
    affectedRows: result.affectedRows
  };
};

/**
 * UPDATE ALL DATA
 */
export const updateAll = async (table, data = {}) => {
    if (!allowedTables.includes(table)) {
        throw new Error(`Table ${table} tidak diizinkan`);
    }

    const setClause = Object.keys(data)
        .map(key => `${key} = ?`)
        .join(", ");

    const sql = `UPDATE ${table} SET ${setClause}`;

    const [result] = await pool.execute(
        sql,
        Object.values(data)
    );

    return {
        affectedRows: result.affectedRows
    };
};

/**
 * COUNT DATA
 */
export const countData = async (table, conditions = {}) => {
  if (!allowedTables.includes(table)) {
    throw new Error(`Table ${table} tidak diizinkan`);
  }

  let sql = `SELECT COUNT(*) as total FROM ${table}`;
  const values = [];

  if (Object.keys(conditions).length > 0) {
    const whereClause = Object.keys(conditions)
      .map(key => `${key} = ?`)
      .join(" AND ");
    sql += ` WHERE ${whereClause}`;
    values.push(...Object.values(conditions));
  }

  const [rows] = await pool.execute(sql, values);

  return rows[0].total;
};

/**
 * CHECK EXISTS
 */
export const exists = async (table, conditions = {}) => {
  if (!allowedTables.includes(table)) {
    throw new Error(`Table ${table} tidak diizinkan`);
  }

  if (Object.keys(conditions).length === 0) {
    throw new Error("Exists memerlukan kondisi");
  }

  const whereClause = Object.keys(conditions)
    .map(key => `${key} = ?`)
    .join(" AND ");

  const sql = `SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`;

  const [rows] = await pool.execute(sql, Object.values(conditions));

  return rows.length > 0;
};