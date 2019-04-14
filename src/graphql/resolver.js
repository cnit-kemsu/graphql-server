import graphqlHTTP from 'express-graphql';
import mariadb from 'mariadb';
import { bindLoaders } from './bindLoaders';
import { formatError } from './formatError';

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
        formatError
    };
  };
  return graphqlHTTP(options);

}