import * as _ from '../../../src/graphql-types';
import { Mapping } from '../../../src/Mapping';
import { Loader } from '../../../src/Loader';

const { toColumns, toFilter, toAssignment } = new Mapping({}, {
  keys: idArray => `id IN (${idArray})`,
  name: 'name = ?'
});

export const RoleType = new _.Object({
  name: 'Role',
  fields: {
    id: { type: new _.NonNull(_.Int) },
    name: { type: new _.NonNull(_.String) }
  }
});

const searchArgs = {
  keys: { type: new _.List(_.Int) },
  name: { type: _.String }
};

const roles = {
  type: new _.List(RoleType),
  args: {
    limit: { type: _.Int },
    offset: { type: _.Int },
    ...searchArgs
  },
  resolve(obj, { limit = 10, offset = 0, ...search }, { db }, info) {
    const cols = toColumns(info);
    const [filter, params] = toFilter(search);
    return db.query(`SELECT ${cols} FROM roles ${filter} LIMIT ? OFFSET ?`, [ ...params, limit, offset ]);
  }
};

const totalRoles = {
  type: _.Int,
  args: searchArgs,
  resolve(obj, search, { db }) {
    const [filter, params] = toFilter(search);
    return db.query(`SELECT COUNT(*) FROM roles ${filter}`, params);
  }
};

const createRole = {
  type: _.Int,
  args: {
    name: { type: new _.NonNull(_.String) }
  },
  async resolve(obj, input, { db }) {
    const [assignment, params] = toAssignment(input);
    return await db.query(`INSERT INTO roles ${assignment}`, params)
      |> #.insertId;
  }
};

const updateRole = {
  type: _.Int,
  args: {
    id: { type: new _.NonNull(_.Int) },
    name: { type: _.String }
  },
  async resolve(obj, { id, ...input }, { db }) {
    const [assignment, params] = toAssignment(input);
    return await db.query(`UPDATE roles ${assignment} WHERE id = ?`, [ ...params, id ])
      |> #.affectedRows;
  }
};

const deleteRole = {
  type: _.Int,
  args: {
    id: { type: new _.NonNull(_.Int) }
  },
  async resolve(obj, { id }, { db }) {
    return await db.query('DELETE FROM roles WHERE id = ?', id)
      |> #.affectedRows;
  }
};

function loadRolesByKeys(keys, { db }, info) {
  const cols = toColumns(info);
  const [filter, params] = toFilter({ keys });
  return db.query(
    `SELECT ${cols} FROM roles ${filter}`,
    params
  );
}

export default [{
  roles,
  totalRoles
}, {
  createRole,
  updateRole,
  deleteRole
}, {
  roleByKey: new Loader(loadRolesByKeys)
}];