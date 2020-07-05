import path from 'path';
import fs from 'fs';
import { logError } from './logError';
import { publicInfo } from './error-info';
import { printError } from './printError';
const fsp = fs.promises;

async function readViewFile(resolve, reject) {
  try{
    path.resolve(__dirname, 'default.html')
    |> await fsp.readFile(#)
    |> #.toString()
    |> resolve(#);
  } catch(error) {
    reject(error);
  }
}
const viewFile = new Promise(readViewFile);

export async function errorLogger(error, request, responce, next) {
  logError(error);
  // const info = publicInfo(error);
  // const errorView = await viewFile;
  
  // if (request.xhr) responce.status(500).json(info);
  // else {
  //   responce.type('text/html');
  //   errorView.replace('<%= errorInfo %>',
  //     info === undefined ? 'No data' : printError(info)
  //   ) |> responce.send(#);
  // }

  //next();
}