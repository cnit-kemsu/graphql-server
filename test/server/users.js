import * as _ from '../../src/graphql-types';
import { Mapping } from '../../src/Mapping';
import { hashPassword } from '../../src/pwdhash';
import { NestedType } from './nested';

async function wait(time) {
  await new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
}

const { toColumns, toFilter, toAssignment } = new Mapping({
  id: 'id',
  username: 'username',
  email: 'email'
}, {
  idIn: idArray => `id IN (${idArray})`,
  username: 'username = ?'
});



const UserType = new _.Object({
  name: 'User',
  fields: () => ({
    id: { type: new _.NonNull(_.Int) },
    username: { type: new _.NonNull(_.String) },
    email: { type: _.String },
    nested: {
      type: NestedType,
      resolve(obj, {}, {}, info) {
        return {
          first: 'lalala'
        };
      }
    }
  })
});

const searchArgs = {
  idIn: { type: new _.List(_.Int) },
  username: { type: _.String },
  email: { type: _.String }
};

const users = {
  type: new _.List(UserType),
  args: {
    limit: { type: _.Int },
    offset: { type: _.Int },
    ...searchArgs
  },
  resolve(obj, { limit = 10, offset = 0, ...search }, { db, user }, info) {
    const cols = toColumns(info);
    const [filter, params] = toFilter(search);
    return db.query(`SELECT ${cols} FROM users ${filter} LIMIT ? OFFSET ?`, [ ...params, limit, offset ]);
  }
};

const totalUsers = {
  type: _.Int,
  args: searchArgs,
  resolve(obj, search, { db }) {
    const [filter, params] = toFilter(search);
    return db.query(`SELECT COUNT(*) FROM users ${filter}`, params);
  }
};

const createUser = {
  type: _.Int,
  args: {
    username: { type: new _.NonNull(_.String) },
    email: { type: _.String },
    password: { type: new _.NonNull(_.String) }
  },
  async resolve(obj, { password, ...input }, { db }) {
    await wait(2000);
    const [assignment, params] = toAssignment({
      pwdhash: hashPassword(password),
      ...input
    });
    return await db.query(`INSERT INTO users ${assignment}`, params)
      |> #.insertId;
  }
};

const updateUser = {
  type: _.Int,
  args: {
    id: { type: new _.NonNull(_.Int) },
    username: { type: _.String },
    email: { type: _.String }
  },
  async resolve(obj, { id, ...input }, { db }) {
    await wait(500);
    const [assignment, params] = toAssignment(input);
    return await db.query(`UPDATE users ${assignment} WHERE id = ?`, [ ...params, id ])
      |> #.affectedRows;
  }
};

const deleteUser = {
  type: _.Int,
  args: {
    id: { type: new _.NonNull(_.Int) }
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
