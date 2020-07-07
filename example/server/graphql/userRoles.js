import { types as _ } from '../../../src/graphql/types';
import { SQLBuilder } from '../../../src/SQLBuilder';
import { upgradeResolveFn } from '../../../src/graphql/upgradeResolveFn';
import { PublicError } from '../../../src/error/PublicError';

const { buildAssignmentList } = new SQLBuilder({
  userId: 'user_id',
  roleId: 'role_id'
}, {}, {
  userId: value => `user_id = ${value}`,
  roleId:  value => `role_id = ${value}`
});

const addRole = {
  type: _.Int,
  args: {
    userId: { type: _.NonNull(_.Int) },
    roleId: { type: _.NonNull(_.Int) }
  },
  async resolve(obj, input, { db }) {
    const [assignmentList, params] = buildAssignmentList(input);
    try {
      return await db.query(`INSERT INTO user_roles ${assignmentList}`, params)
        |> #.affectedRows;
    } catch(error) {
      if (error.code === 'ER_DUP_ENTRY') return 0;
      if (error.code === 'ER_NO_REFERENCED_ROW_2') throw new PublicError(
        error, (
          error.message.includes('user_roles_ibfk_1')
          ? 'Role' : 'User'
        ) + " doesn't exists", 'Unmet constraint'
      );
      throw error;
    }
  }
};

const removeRole = {
  type: _.Int,
  args: {
    userId: { type: _.NonNull(_.Int) },
    roleId: { type: _.NonNull(_.Int) }
  },
  async resolve(obj, { userId, roleId }, { db }) {
    return await db.query('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId])
      |> #.affectedRows;
  }
};

export default { mutation: {
  addRole,
  removeRole
}};
