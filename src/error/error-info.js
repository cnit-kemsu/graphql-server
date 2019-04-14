import { PublicError } from "./PublicError";
import { prettifyStack } from './prettifyStack';

function rootCauseInfo(error) {
  if (error === undefined) return undefined;
  const { message, stack, name, ...props } = error;
  return {
    rootCause: {
      [name]: {
        message,
        stack: prettifyStack(stack),
        ...props
      }
    }
  };
} 

export function privateInfo(error) {
  
  if (error instanceof PublicError) {
    const { message, stack, clientInfo, rootCause } = error;
    return {
      PublicError: {
        message,
        clientInfo,
        stack: prettifyStack(stack),
        ...rootCauseInfo(rootCause)
      }
    };
  }

  const { name, message, stack, ...props } = error;
  return {
    [name]: {
      message,
      stack: prettifyStack(stack),
      ...props
    }
  };
}

export function publicInfo(error) {

  if (process.env.NODE_ENV === 'development'
  ) return privateInfo(error);

  if (error instanceof PublicError) {
    const { message, clientInfo } = error;
    return {
      PublicError: {
        message,
        clientInfo
      }
    };
  }

  return undefined;
}




