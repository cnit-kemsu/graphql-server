import sqlite from 'sqlite';

async function initdb() {
  const db = await sqlite.open('./test/localdb');
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id integer NOT NULL PRIMARY KEY,
    username text NOT NULL UNIQUE,
    email text
  )`);
  db.close();
}

initdb();