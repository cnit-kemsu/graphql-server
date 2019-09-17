import { types as _ } from '../../../src/graphql/types';
import { SQLBuilder, jsonArray } from '../../../src/SQLBuilder';
import { upgradeResolveFn } from '../../../src/graphql/upgradeResolveFn';
import { hashPassword } from '../../../src/auth/pwdhash';
import { RoleType } from './roles';
import { authorize } from '../../../src/graphql/authorize';

async function wait(time) {
  await new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
}

const { buildSelectExprList, buildWhereClause, buildAssignmentList } = new SQLBuilder({
  id: 'id',
  username: 'username',
  email: 'email',
  file: 'file_txt',
  roles: {
    id: 'id',
    roleKeys: `(SELECT ${jsonArray('role_id')} FROM user_roles WHERE user_id = id)`
  }
}, {
  idIn: idArray => `id IN (${idArray})`,
  username: 'username = ?'
}, {
  id: 'id',
  username: 'username',
  email: 'email',
  file: 'file_txt',
});

const UserType = _.Object({
  name: 'User',
  fields: {
    id: { type: _.NonNull(_.Int) },
    username: { type: _.NonNull(_.String) },
    email: { type: _.String },
    roles: {
      type: _.List(RoleType),
      resolve({ roleKeys }, {}, { roleByKey }, fields) {
        if (!roleKeys) return;
        return roleByKey.loadMany(JSON.parse(roleKeys), fields);
      }
    } |> upgradeResolveFn
  }
});

const searchArgs = {
  idIn: { type: _.List(_.Int) },
  username: { type: _.String },
  email: { type: _.String }
};

const users = {
  type: _.List(UserType),
  args: {
    limit: { type: _.Int },
    offset: { type: _.Int },
    ...searchArgs
  },
  async resolve(obj, { limit = 10, offset = 0, ...search }, { db, user }, fields) {
    authorize(user);
    const [selectExprList] = buildSelectExprList(fields);
    const [whereCaluse, params] = buildWhereClause(search);
    const res = await db.query(`SELECT ${selectExprList} FROM users ${whereCaluse} LIMIT ? OFFSET ?`, [ ...params, limit, offset ]);
    return res;
  }
} |> upgradeResolveFn;

const totalUsers = {
  type: _.Int,
  args: searchArgs,
  async resolve(obj, search, { db }) {
    const [whereCaluse, params] = buildWhereClause(search);
    return await db.query(`SELECT COUNT(*) count FROM users ${whereCaluse}`, params)
      |> #[0].count;
  }
};

const createUser = {
  type: _.Int,
  args: {
    username: { type: _.NonNull(_.String) },
    email: { type: _.String },
    password: { type: _.NonNull(_.String) },
    file: { type: _.JSON }
  },
  async resolve(obj, { password, file, ...input }, { db }) {
    //await wait(2000);

    const [assignmentList, params] = buildAssignmentList({
      pwdhash: hashPassword(password),
      ...input,
      file: file?.buffer
    });
    return await db.query(`INSERT INTO users ${assignmentList}`, params)
      |> #.insertId;
  }
};

const updateUser = {
  type: _.Int,
  args: {
    id: { type: _.NonNull(_.Int) },
    username: { type: _.String },
    email: { type: _.String }
  },
  async resolve(obj, { id, ...input }, { db }) {
    await wait(500);
    const [assignmentList, params] = buildAssignmentList(input);
    return await db.query(`UPDATE users ${assignmentList} WHERE id = ?`, [ ...params, id ])
      |> #.affectedRows;
  }
};

const deleteUser = {
  type: _.Int,
  args: {
    id: { type: _.NonNull(_.Int) }
  },
  async resolve(obj, { id }, { db }) {
    await wait(1000);
    return await db.query('DELETE FROM users WHERE id = ?', id)
      |> #.affectedRows;
  }
};

export default [{
  users,
  totalUsers
}, {
  createUser,
  updateUser,
  deleteUser
}];
