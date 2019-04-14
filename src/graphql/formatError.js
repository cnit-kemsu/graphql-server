import { logError } from '../error/logError';
import { publicInfo } from '../error/error-info';
import { GraphQLError } from './GraphQLError';
import { PublicError } from '../error/PublicError';

export function formatError({ message, locations, path, originalError }) {

  let info;
  if (originalError === undefined) info = { message };
  else if (originalError instanceof GraphQLError) info = originalError.info;
  else {
    info = publicInfo(originalError);
    if (originalError instanceof PublicError) info = info.PublicError;
    else if (info === undefined) info = {
      message: 'An error has occured'
    };
    logError(originalError);
  }
  return {
    ...info,
    locations,
    path
  };
}