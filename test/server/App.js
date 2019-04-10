import express from 'express';
import { graphqlResolver } from '../../src/graphql-middleware';
import { dbConfig, jwtSecret } from './config.js';
import { userInfo } from '../../src/auth-middleware';
import schema from './graphql_schema';

const app = express();

app.use(userInfo(jwtSecret));
app.use('/graphql', graphqlResolver(dbConfig, schema));

app.listen(8080);