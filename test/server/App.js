import express from 'express';
import { graphqlResolver } from '../../src/graphqlResolver';
import { dbConfig, jwtSecret } from './config.js';
import { userInfo } from '../../src/userInfo';
import { schema, loaders } from './graphql';
import { errorLogger } from '../../src/error-logging/errorLogger';
import { handleUncaughtErrors } from '../../src/error-logging/handleUncaughtErrors';

//process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';

handleUncaughtErrors();

const app = express();

app.use(userInfo(jwtSecret));
app.use('/graphql', graphqlResolver(dbConfig, schema, loaders));

app.use('/error', () => {
  throw Error('Expected error');
});

app.use(errorLogger);

app.listen(8080);