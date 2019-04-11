import graphqlHTTP from 'express-graphql';
import mariadb from 'mariadb';

function bindLoaders(loaders, context) {
  for (const [name, loader] of Object.entries(loaders)) {
    context[name] = loader.bind(context);
  }
}

export function graphqlResolver(dbConfig, schema, loaders) {

  const pool = mariadb.createPool(dbConfig);
  const options = async ({ user }) => {
    const db = await pool.getConnection();
    const context = {
      user,
      db
    };
    bindLoaders(loaders, context);
    return {
        schema,
        context,
        extensions() {
          if (db !== undefined) db.end();
        },
        //formatError:
    };
  };
  return graphqlHTTP(options);

}