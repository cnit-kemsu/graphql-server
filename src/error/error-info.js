import { PublicError } from "./PublicError";
import { prettifyStack } from './prettifyStack';

function rootCauseInfo(error) {
  if (error === undefined) return undefined;
  const { message, stack, name, ...props } = error;
  return {
    rootCause: {
      name,
      message,
      ...props
    }
  };
} 

export function privateInfo(error) {
  
  if (error instanceof PublicError) {
    const { name, message, stack, clientInfo, rootCause, ...props } = error;
    return {
      message,
      clientInfo,
      stack: prettifyStack(stack),
      ...props,
      ...rootCauseInfo(rootCause)
    };
  }

  const { name, message, stack, ...props } = error;
  return {
    name,
    message,
    stack: prettifyStack(stack),
    ...props
  };
}

export function publicInfo(error) {

  if (process.env.NODE_ENV === 'development'
  ) return privateInfo(error);

  if (error instanceof PublicError) {
    const { name, message, clientInfo } = error;
    return {
      message,
      clientInfo
    };
  }

  return undefined;
}




