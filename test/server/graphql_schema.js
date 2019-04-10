import { composeSchema } from '../../src/graphql-schema';
import signin from './signin';
import users from './users';

export default composeSchema([
  signin,
  users
]);