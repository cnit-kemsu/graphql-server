import { logToFile } from './logToFile';

const includeChunk = '\\build\\webpack:\\src';
const deleteChunk = process.cwd() + includeChunk;
const formatStack = stack => stack.split('\n').filter(
  trace => trace.includes(deleteChunk)
).map(
  trace => trace.replace(/(\s{4}at\s)/g, '')
    .replace(deleteChunk, '')
);

const formatError = error => {
  const { name, message, stack, ...restProps } = error;
  return {
    name, message,
    stack: formatStack(stack),
    ...restProps
  };
};

const printError = (error, includeTime = false) => {
  const { name, message, clientInfo, originalError, ...restProps } = error;
  // delete restProps.publicProps;
  // const { ..._originalError } = originalError || {};
  // delete _originalError.name;

  // const name = error.originalError?.name || error.name;
  // const name = error.originalError?.name || error.name;

  // if (error instanceof PublicError) {
  //   const { message, clientInfo, originalError } = error;

  //   if (DEVELOPMENT) {
  //     const { stack, ...props } = originalError;
  //     return {
  //       message,
  //       clientInfo,
  //       stack,
  //       ...props
  //     };
  //   }

  //   return {
  //     message,
  //     clientInfo
  //   };
  // }

  return name 
    + (includeTime ? ' (' + new Date().toLocaleString() + ')' : '')
    + ': '
    + JSON.stringify({
        //..._originalError,
        name,
        message,
        clientInfo,
        originalError,
        ...restProps
      }, null, ' '
    ).replace(/(\\{2})/g, '\\');
};

export function logError (error) {
  if (process.env.NODE_ENV === 'development') {
    //printError(error) |> console.error(#);
    console.error(error);
  } else {
    //printError(error, true) |> logToFile(#);
    // const a = name 
    // + ' (' + new Date().toLocaleString() + ')'
    // + ': '
    // + JSON.stringify({
    //     //..._originalError,
    //     name,
    //     message,
    //     clientInfo,
    //     originalError,
    //     ...restProps
    //   }, null, ' '
    // ).replace(/(\\{2})/g, '\\');
    const a = new Date().toLocaleString() + ' ' + (error.originalError?.toString() || error.toString());
    logToFile(a);
  }
}