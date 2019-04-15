function addSpaceToLine(line) {
  return ' ' + line;
}

export function addSpaces(text) {
  return text.split('\n').map(addSpaceToLine).join('\n');
}

function printProp([key, value]) {
  return key + ': '
  + JSON.stringify(value, null, ' ')
  + '\n';
}

export function printError(error) {
  return Object.entries(error).map(printProp).join('');
}