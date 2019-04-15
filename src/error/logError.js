import { logToFile } from './logToFile';
import { privateInfo } from './error-info';
import { printError, addSpaces } from './printError';

export function logError (error) {
  if (process.env.NODE_ENV === 'development') {
    privateInfo(error)
    |>  printError(#)
    |> 'An error has occured: \n' + addSpaces(#)
    |> console.error(#);
  } else {
    JSON.stringify({
      time: new Date().toLocaleString(),
      cause: privateInfo(error)
    }, null, ' ')
    |> logToFile(#);
  }
}