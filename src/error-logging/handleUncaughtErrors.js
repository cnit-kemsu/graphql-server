import { logError } from './logError';

function uncaughtErrorCallback(error) {
  logError(error);
}

export function handleUncaughtErrors() {
  process.on('uncaughtException', uncaughtErrorCallback);
  process.on('unhandledRejection', uncaughtErrorCallback);
}
