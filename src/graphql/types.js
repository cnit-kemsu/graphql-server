import {
  GraphQLInt as Int,
  GraphQLFloat as Float,
  GraphQLString as String,
  GraphQLBoolean as Boolean,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInterfaceType
} from 'graphql';
import JSON from 'graphql-type-json';

function NonNull(type) {
  return new GraphQLNonNull(type);
}
function Object(type) {
  return new GraphQLObjectType(type);
}
function InputObject(type) {
  return new GraphQLInputObjectType(type);
}
function List(type) {
  return new GraphQLList(type);
}
function EnumType(type) {
  return new GraphQLEnumType(type);
}
function Interface(type) {
  return new GraphQLInterfaceType(type);
}

export const types = {
  Int,
  Float,
  String,
  Boolean,
  EnumType,
  NonNull,
  Object,
  InputObject,
  List,
  Interface,
  JSON
};