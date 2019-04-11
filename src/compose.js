import { GraphQLSchema, GraphQLObjectType } from 'graphql';

function groupByIndex([queryFields, mutationFields, loaders], element) {
  return [{
    ...queryFields,
    ...element[0]
  }, {
    ...mutationFields,
    ...element[1]
  }, {
    ...loaders,
    ...element[2]
  }];
}

export function compose(elements) {

  return elements.reduce(groupByIndex, [ {}, {}, {} ])
  |> {

    schema: new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: #[0]
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: #[1]
      })
    }),

    loaders: #[2]

  };
}