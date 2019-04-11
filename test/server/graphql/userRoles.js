import * as _ from '../../../src/graphql-types';
import { Mapping } from '../../../src/Mapping';

const { toAssignment } = new Mapping({
  userId: 'user_id',
  roleId: 'role_id'
});

const addRole = {
  type: _.Int,
  args: {
    userId: { type: new _.NonNull(_.Int) },
    roleId: { type: new _.NonNull(_.Int) }
  },
  async resolve(obj, input, { db }) {
    const [assignment, params] = toAssignment(input);
    // return await db.query(`INSERT INTO user_roles ${assignment}`, params)
    //   |> #.insertId;
    let result;
    try {
      return await db.query(`INSERT INTO user_roles ${assignment}`, params)
        |> #.affectedRows;
    } catch(error) {
      if (error.code === 'ER_DUP_ENTRY') return 0;
      if (error.code === 'ER_NO_REFERENCED_ROW_2') throw new Error(
        error.message.includes('user_roles_ibfk_1') ? 'No such user' : 'No such role'
      );
      throw error;
    }
  }
};

const removeRole = {
  type: _.Int,
  args: {
    userId: { type: new _.NonNull(_.Int) },
    roleId: { type: new _.NonNull(_.Int) }
  },
  async resolve(obj, { userId, roleId }, { db }) {
    return await db.query('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId])
      |> #.affectedRows;
  }
};

export default [,{
  addRole,
  removeRole
}];
