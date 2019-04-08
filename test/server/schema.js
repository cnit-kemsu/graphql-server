import {
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType
} from 'graphql';

import { mapFields } from '../../src/mapFields';
import { mapFilter } from '../../src/mapFilter';

async function wait(time) {
  await new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
}

const fields = {
  id: 'id',
  username: 'username',
  email: 'email'
};

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString }
  })
});


const filterType = new GraphQLInputObjectType({
  name: 'UsersFilter',
  fields: {
    idIn: { type: new GraphQLList(GraphQLInt) },
    username: { type: GraphQLString },
    email: { type: GraphQLString }
  }
});

const filterMapper = {
  idIn: param => `id IN (${param})`,
  username: param => `username = ${param}`
};

const users = {
  type: new GraphQLList(UserType),
  args: {
    limit: { type: GraphQLInt },
    filter: { type: filterType }
  },
  resolve: async (obj, { filter, limit = -1 }, { db }, info) => {
    const [where, params] = mapFilter(filter, filterMapper);
    const sql = `SELECT ${mapFields(info, fields)} FROM users ${where}`;
    const result = await db.query(sql, params);
    return result;
  }
};

const createUser = {
  type: UserType,
  args: {
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString }
  },
  async resolve(obj, { username, email }, { db }) {
    await wait(2000);
    const { insertId: id } = await db.query(`INSERT INTO users (username, email) VALUES(?,?)`, [username, email]);
    return {
      id,
      username,
      email
    };
  }
};

const updateUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    username: { type: GraphQLString },
    email: { type: GraphQLString }
  },
  async resolve(obj, { id, username, email }, { db }) {
    await db.query(`UPDATE users SET username = ?, email = ? WHERE id = ?`, [username, email, id]);
    const result = await db.query(`SELECT id, username, email FROM users WHERE id = :id`, { id });
    return result[0];
  }
};

const deleteUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  async resolve(obj, { id }, { db }) {
    await wait(1000);
    const result = await db.query(`SELECT id, username, email FROM users WHERE id = :id`, { id });
    await db.query(`DELETE FROM users WHERE id = ?`, [id]);
    return result[0];
  }
};

export default new GraphQLSchema({

  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: users
    }
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser,
      updateUser,
      deleteUser
    }
  })

});