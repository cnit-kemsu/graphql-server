import { PublicError } from "./PublicError";

export function publicInfo(error) {

  const DEVELOPMENT = process.env.NODE_ENV === 'development';

  if (error instanceof PublicError) {
    const { message, stack, name, clientInfo, originalError } = error;

    if (DEVELOPMENT) {
      return {
        message,
        stack,
        name,
        clientInfo,
        originalError
      };
    }

    return {
      message,
      clientInfo
    };
  }

  if (DEVELOPMENT) {
    const { message, stack, name, ...props } = error;
    return {
      message,
      stack,
      name,
      ...props
    };
  }
  return {
    message: 'An error has occured'
  };
}




