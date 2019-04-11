import express from 'express';
import { graphqlResolver } from '../../src/graphqlResolver';
import { dbConfig, jwtSecret } from './config.js';
import { userInfo } from '../../src/userInfo';
import { schema, loaders } from './graphql';

const app = express();

app.use(userInfo(jwtSecret));
app.use('/graphql', graphqlResolver(dbConfig, schema, loaders));

app.listen(8080);