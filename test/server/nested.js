import * as _ from '../../src/graphql-types';

export const RoleType = new _.Object({
  name: 'Nested',
  fields: () => ({
    first: { type: _.String },
    second: { type: _.String }
  })
});

const roles = [{
  userId: 1,
  role: 'admin'
}, {
  userId: 1,
  role: 'instructor'
}, {
  userId: 2,
  role: 'instructor'
}];

async function loadRolesByUser(keys) {
  
  this.db.query(`SELECT ${cols} FROM users ${filter} LIMIT ? OFFSET ?`, [ ...params, limit, offset ]);
}

export default [{}, {}, {
  loadNested
}];