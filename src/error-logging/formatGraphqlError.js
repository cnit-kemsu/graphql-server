import { logError } from './logError';

export function formatGraphQLError(error) {

  const originalError = error.originalError;
  const publicError = originalError;
  logError({
    ... !originalError && { name: 'GraphQLError' },
    message: error.message,
    ...originalError,
    graphQLPath: error.path
  });
  return {
    ... !originalError && { clientInfo: 'Bad graphql request' },
    ...publicError,
    locations: error.locations,
    path: error.path,
    ... !originalError && { message: error.message }
  };
}