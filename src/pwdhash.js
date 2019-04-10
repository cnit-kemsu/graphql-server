import crypto from 'crypto';

export function hashPassword(password, salt) {
  return salt || crypto.randomBytes(31).toString('base64')
    |> # + crypto.createHmac('sha512', #).update(password).digest('base64');
}

export function verifyPassword(password, pwdhash) {
  return pwdhash.substring(0, 44)
   |> hashPassword(password, #) === pwdhash;
}