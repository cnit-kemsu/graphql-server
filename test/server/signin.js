import jwt from 'jsonwebtoken';
import * as _ from '../../src/graphql-types';
import { jwtSecret } from './config.js';
import { verifyPassword } from '../../src/pwdhash';

const signIn = {
  type: _.JSON,
  args: {
    login: { type: _.String },
    password: { type: _.String }
  },
  async resolve(obj, { login, password }, { db }) {
    const [user] = await db.query(
      `SELECT id, username, email, pwdhash FROM users WHERE ? IN (username, email)`,
      [login]
    );

    if (user !== undefined
      && verifyPassword(password, user.pwdhash)
    ) {
      delete user.pwdhash;
      return {
        ...user,
        bearer: jwt.sign(user, jwtSecret)
      };
    }
    // TODO: throw error
    throw new Error('Invalid login or password');
  }
};

export default [{
  signIn
}];