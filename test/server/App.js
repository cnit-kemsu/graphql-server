import express from 'express';
import graphqlHTTP from 'express-graphql';
import mariadb from 'mariadb';
import schema from './schema';

import connect from '../connect.json';
const pool = mariadb.createPool(connect);

const app = express();

app.use('/graphql', graphqlHTTP( 
  async () => {
    const db = await pool.getConnection();
    return {
        schema,
        context: {
          db
        },
        extensions() {
          db.end();
        }
    };
  }
));

app.listen(8080);