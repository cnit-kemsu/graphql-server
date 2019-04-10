import path from 'path';
import fs from 'fs';
import mariadb from 'mariadb';
import { hashPassword } from '../../src/pwdhash';
import { dbConfig, superUser } from './config.js';

const dbSchema = path.resolve(__dirname, './db_schema.sql')
  |> fs.readFileSync(#).toString();
  
const pool = mariadb.createPool({
  ...dbConfig,
  multipleStatements: true
});

async function initdb() {

  let db;
  try {

    db = await pool.getConnection();
    await db.query(dbSchema + `
      INSERT INTO users (username, pwdhash) values (?, ?)
    `, [
      superUser.username,
      hashPassword(superUser.password)
    ]);

  } catch (error) {
    console.error(error);
  } finally {
    db.end();
  }
  process.exit();
}

initdb();


