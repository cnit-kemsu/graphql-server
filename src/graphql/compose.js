import { GraphQLSchema, GraphQLObjectType } from 'graphql';

export function compose(schemaComponents) {
  const queryFields = {};
  const mutationFields = {};
  const loaders = {};

  for (const component of schemaComponents) {
    Object.assign(queryFields, component.query);
    Object.assign(mutationFields, component.mutation);
    Object.assign(loaders, component.loaders);
  }

  let query, mutation;
  if (Object.keys(queryFields).length > 0) mutation = new GraphQLObjectType({ name: 'Query', fields: queryFields });
  if (Object.keys(mutationFields).length > 0) mutation = new GraphQLObjectType({ name: 'Mutation', fields: mutationFields });

  return {
    schema: new GraphQLSchema({ query, mutation }),
    loaders
  };
}