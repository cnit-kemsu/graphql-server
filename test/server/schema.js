import * as _ from '../../src/GraphqlType';

function toQueries(fields, [queries]) {
  return { ...fields, ...queries };
}
function toMutations(fields, [, mutations]) {
  return { ...fields, ...mutations };
}

const schema = [
  require('./users')
];

export default new _.Schema({

  query: new _.Object({
    name: 'Query',
    fields: schema.reduce(toQueries, {})
  }),

  mutation: new _.Object({
    name: 'Mutation',
    fields: schema.reduce(toMutations, {})
  })

});