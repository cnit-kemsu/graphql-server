import { GraphQLError } from './GraphQLError';

export function authorize(user) {
  if (user === undefined) throw new GraphQLError('Not authorized');
}