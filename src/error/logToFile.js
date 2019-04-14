import path from 'path';
import fs from 'fs';
const fsp = require('fs').promises;

const rootDir = process.cwd();
const logDir = path.resolve(rootDir, 'logs');
const logFile = path.resolve(logDir, 'errors.json');

export async function logToFile(error) {
  let filehandle;
  try {

    if (!fs.existsSync(logDir)) await fsp.mkdir(logDir);
    if (!fs.existsSync(logFile)) await fsp.appendFile(logFile, '[' + error +']');
    else {
      filehandle = await fsp.open(logFile, 'r+');
      const stat = await filehandle.stat();
      await filehandle.write(', ' + error + ']', stat.size - 1);
    }

  } catch (err) {
    console.error(err);
  } finally {
    if (filehandle !== undefined) filehandle.close();
  }
}

// async function test() {
//   await logToFile('test');
//   process.exit();
// }

// test();