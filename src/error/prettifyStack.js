const currentPath = process.cwd();
function excludeNonAppFiles(trace) {
  return trace.includes(currentPath)
    && !trace.includes('node_modules');
}

const currentPathFragment = currentPath + '\\';
const inceptionFragment = /(\s{4}at\s)/g;
const backSlashFragment = /\\/g;
function prettifyTrace(trace) {
  return trace.replace(currentPathFragment, '')
    .replace(inceptionFragment, '')
    .replace(backSlashFragment, '/');
}

export function prettifyStack(stack) {
  return stack.split('\n')
    .filter(excludeNonAppFiles)
    .map(prettifyTrace);
}