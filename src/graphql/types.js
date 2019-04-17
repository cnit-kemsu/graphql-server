// export {
//   GraphQLNonNull as NonNull,
//   GraphQLInt as Int,
//   GraphQLString as String,
//   GraphQLObjectType as Object,
//   GraphQLList as List,
//   GraphQLBoolean as Boolean,
//   GraphQLEnumType as EnumType,
//   GraphQLInputObjectType as InputObject,
//   GraphQLInterfaceType as Interface
// } from 'graphql';
// export { default as JSON } from 'graphql-type-json';

import {
  GraphQLNonNull as NonNull,
  GraphQLInt as Int,
  GraphQLString as String,
  GraphQLObjectType as Object,
  GraphQLList as List,
  GraphQLBoolean as Boolean,
  GraphQLEnumType as EnumType,
  GraphQLInputObjectType as InputObject,
  GraphQLInterfaceType as Interface
} from 'graphql';
import JSON from 'graphql-type-json';

export const types = {
  NonNull,
  Int,
  String,
  Object,
  List,
  Boolean,
  EnumType,
  InputObject,
  Interface,
  JSON
};