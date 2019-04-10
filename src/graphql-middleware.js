import graphqlHTTP from 'express-graphql';
import mariadb from 'mariadb';

export function graphqlResolver(dbConfig, schema) {

  const pool = mariadb.createPool(dbConfig);
  const options = async ({ user }) => {
    const db = await pool.getConnection();
    return {
        schema,
        context: {
          user,
          db
        },
        extensions() {
          if (db !== undefined) db.end();
        },
        //formatError:
    };
  };
  return graphqlHTTP(options);

}