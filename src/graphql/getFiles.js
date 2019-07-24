function propNameToPathUnit(propName) {
  return isNaN(propName)
    ? '.' + propName
    : '[' + propName + ']';
}

function arrayToPath(pathArray) {
  return pathArray.map(propNameToPathUnit).join('');
}

function toArgFile({ mimetype, buffer, pathArray: [, ...pathArray] }) {
  return {
    mimetype,
    buffer,
    path: arrayToPath(pathArray)
  };
}

function toRestFiles(restFiles, { mimetype, buffer, pathArray }) {
  return {
    ...restFiles,
    [pathArray.join('.')]: {
      mimetype,
      buffer
    }
  };
}

export function getFiles(files, argKeys, resolveInfo) {

  const currentKey = resolveInfo.path.key;
  // alternative
  //const currentKey = resolveInfo.fieldNodes.alias?.value || resolveInfo.fieldNodes.name.value;

  const currentFiles = files.filter(file => file.key === currentKey);

  const filesByArgs = argKeys.reduce(
    
    (allFiles, argName) => {
      const argFiles = currentFiles
        .filter(({ pathArray: [key] }) => key === argName)
        .map(toArgFile);

      if (argFiles.length === 0) return argFiles;
      return {
        ...allFiles,
        [argName]: argFiles
      };
    }

  , {});

  const restFiles = currentFiles
    .filter(({ pathArray: [key] }) => !argKeys.includes(key))
    .reduce(toRestFiles, {});


  return {
    ...filesByArgs,
    ...restFiles
  };
}