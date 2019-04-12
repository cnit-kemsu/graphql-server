import path from 'path';
import fs from 'fs';
const fsp = require('fs').promises;

const rootDir = process.cwd();
const logDir = path.resolve(rootDir, 'logs');
const logFile = path.resolve(logDir, 'errors.txt');

export async function logToFile(error) {
  if (!fs.existsSync(logDir)) {
    try {
      await fsp.mkdir(logDir);
    } catch(err) {
      console.error(err);
      return;
    }
  }
  try {
    await fsp.appendFile(logFile, error + '\r\n');
  } catch (err) {
    console.error(err);
  }
}

// async function test() {
//   await logToFile('test');
//   process.exit();
// }

// test();