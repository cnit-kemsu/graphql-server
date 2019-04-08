import path from 'path';
import fs from 'fs';
import mariadb from 'mariadb';
import connect from './connect.json';

const dbSchema = path.resolve(__dirname, './db_schema.sql')
|> fs.readFileSync(#).toString();
const pool = mariadb.createPool(connect);

async function initdb() {
  let db;
  try {
    db = await pool.getConnection();
    await db.query(dbSchema);
  } catch (error) {
    console.error(error);
  } finally {
    db.end();
  }
}

initdb();



