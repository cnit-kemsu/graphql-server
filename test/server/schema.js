import {
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

async function wait(time) {
  await new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
}

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString }
  })
});

const users = {
  type: new GraphQLList(UserType),
  args: {
    limit: { type: GraphQLInt }
  },
  resolve: async (obj, { limit }, { db }) => {
    const result = await db.all(`SELECT id, username, email FROM users LIMIT ?`, limit || -1);
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
    const { lastID: id } = await db.run(`INSERT INTO users (username, email) VALUES(?,?)`, username, email);
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
    await db.run(`UPDATE users SET username = ?, email = ? WHERE id = ?`, username, email, id);
    const result = await db.all(`SELECT id, username, email FROM users WHERE id = $id`, id);
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
    const result = await db.all(`SELECT id, username, email FROM users WHERE id = $id`, id);
    await db.run(`DELETE FROM users WHERE id = ?`, id);
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