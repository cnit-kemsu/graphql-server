import { compose } from '../../../src/compose';
import signin from './signin';
import users from './users';
import roles from './roles';
import userRoles from './userRoles';

export const { schema, loaders } = compose([
  signin,
  users,
  roles,
  userRoles
]);