import express from 'express';
import { graphqlResolver } from '../../src/graphql/resolver';
import { dbConfig, jwtSecret } from './config.js';
import { userInfo } from '../../src/auth/userInfo';
import { schema, loaders } from './graphql';
import { errorLogger } from '../../src/error/errorLogger';
import { handleUncaughtErrors } from '../../src/error/handleUncaughtErrors';
import { PublicError } from '../../src/error/PublicError';

//process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';

handleUncaughtErrors();

const app = express();

app.use(userInfo(jwtSecret));
app.use('/graphql', graphqlResolver(dbConfig, schema, loaders));

app.use('/error', () => {
  //throw new Error('Expected error');
  //throw new PublicError('Expected public error', 'Do nothing');
  try {
    throw new Error('Expected error');
  } catch(error) {
    throw new PublicError(error, 'Expected public error', 'Do nothing');
  }
});

app.use(errorLogger);

app.listen(8080);