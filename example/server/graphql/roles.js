import { types as _ } from '../../../index';
import { SQLBuilder } from '../../../src/SQLBuilder';
import { upgradeResolveFn } from '../../../src/graphql/upgradeResolveFn';
import { Loader } from '../../../src/Loader';
import { collation } from '../../../src/Loader/collation';

const { buildSelectExprList, buildWhereClause, buildAssignmentList } = new SQLBuilder({}, {
  keys: idArray => `id IN (${idArray})`,
  name: value => `name = ${value}`
}, {});

export const RoleType = _.Object({
  name: 'Role',
  fields: {
    id: { type: _.NonNull(_.Int) },
    name: { type: _.NonNull(_.String) }
  }
});

const searchArgs = {
  keys: { type: _.List(_.Int) },
  name: { type: _.String }
};

const roles = {
  type: _.List(RoleType),
  args: {
    limit: { type: _.Int },
    offset: { type: _.Int },
    ...searchArgs
  },
  resolve(obj, { limit = 10, offset = 0, ...search }, { db }, { fields }) {
    const [selectExprList] = buildSelectExprList(fields);
    const [whereCaluse, params] = buildWhereClause(search);
    return db.query(`SELECT ${selectExprList} FROM roles ${whereCaluse} LIMIT ? OFFSET ?`, [ ...params, limit, offset ]);
  }
} |> upgradeResolveFn;

const totalRoles = {
  type: _.Int,
  args: searchArgs,
  resolve(obj, search, { db }) {
    const [whereCaluse, params] = buildWhereClause(search);
    return db.query(`SELECT COUNT(*) FROM roles ${whereCaluse}`, params);
  }
};

const createRole = {
  type: _.Int,
  args: {
    name: { type: _.NonNull(_.String) }
  },
  async resolve(obj, input, { db }) {
    const [assignmentList, params] = buildAssignmentList(input);
    return await db.query(`INSERT INTO roles ${assignmentList}`, params)
      |> #.insertId;
  }
};

const updateRole = {
  type: _.Int,
  args: {
    id: { type: _.NonNull(_.Int) },
    name: { type: _.String }
  },
  async resolve(obj, { id, ...input }, { db }) {
    const [assignmentList, params] = buildAssignmentList(input);
    return await db.query(`UPDATE roles ${assignmentList} WHERE id = ?`, [ ...params, id ])
      |> #.affectedRows;
  }
};

const deleteRole = {
  type: _.Int,
  args: {
    id: { type: _.NonNull(_.Int) }
  },
  async resolve(obj, { id }, { db }) {
    return await db.query('DELETE FROM roles WHERE id = ?', id)
      |> #.affectedRows;
  }
};

function loadRolesByKeys(keys, { db }, fields) {
  const [selectExprList] = buildSelectExprList(fields);
  const [whereClause, params] = buildWhereClause({ keys });
  return db.query(
    `SELECT ${selectExprList} FROM roles ${whereClause}`,
    params
  );
}

export default { query: {
  roles,
  totalRoles
}, mutation: {
  createRole,
  updateRole,
  deleteRole
}, loaders: {
  roleByKey: new Loader(loadRolesByKeys, collation.find('id'))
}};