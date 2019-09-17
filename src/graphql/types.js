import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInterfaceType
} from 'graphql';
import JSON from 'graphql-type-json';

export const types = {
  Int: GraphQLInt,
  Float: GraphQLFloat,
  String: GraphQLString,
  Boolean: GraphQLBoolean,
  
  NonNull(type) {
    return new GraphQLNonNull(type);
  },
  Object(type) {
    return new GraphQLObjectType(type);
  },
  InputObject(type) {
    return new GraphQLInputObjectType(type);
  },
  List(type) {
    return new GraphQLList(type);
  },
  EnumType(type) {
    return new GraphQLEnumType(type);
  },
  Interface(type) {
    return new GraphQLInterfaceType(type);
  },

  JSON
};