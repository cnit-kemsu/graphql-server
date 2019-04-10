import { GraphQLSchema, GraphQLObjectType } from 'graphql';

function pickQuery(fields, [queries]) {
  return { ...fields, ...queries };
}
function pickMutation(fields, [, mutations]) {
  return { ...fields, ...mutations };
}

export function composeSchema(elements) {

  return new GraphQLSchema({

    query: new GraphQLObjectType({
      name: 'Query',
      fields: elements.reduce(pickQuery, {})
    }),

    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: elements.reduce(pickMutation, {})
    })

  });
}