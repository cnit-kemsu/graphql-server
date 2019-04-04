import express from 'express';
import graphqlHTTP from 'express-graphql';
import sqlite from 'sqlite';
import schema from './schema';

const app = express();

app.use('/graphql', graphqlHTTP( 
  async () => {
    const db = await sqlite.open('./test/localdb');
    return {
        schema,
        context: {
          db
        },
        extensions() {
          db.close();
        }
    };
  }
));

app.listen(8080);