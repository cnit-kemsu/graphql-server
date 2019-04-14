export function printError(error) {
  return Object.keys(error)[0] + ': '
    + JSON.stringify(Object.values(error)[0], null, ' ');
}