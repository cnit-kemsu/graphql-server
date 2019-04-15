import { logError } from '../error/logError';
import { publicInfo } from '../error/error-info';
import { GraphQLError } from './GraphQLError';

export function formatError({ message, locations, path, originalError }) {

  let info;
  if (originalError === undefined) info = { message };
  else if (originalError instanceof GraphQLError) info = originalError.info;
  else {
    logError(originalError);
    info = publicInfo(originalError) || {
      message: 'An error has occured'
    };
  }
  return {
    ...info,
    locations,
    path
  };
}