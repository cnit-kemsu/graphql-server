import jwt from 'jsonwebtoken';

export function signBearer(user, secret) {
  return jwt.sign(user, secret);
}