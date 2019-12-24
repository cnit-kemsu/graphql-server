import jwt from 'jsonwebtoken';

export function userInfo(secret) {

  return (req, res, next) => {

    const token = req.headers['authorization']
      || req.headers['x-auth-token']
      || req.headers['x-access-token']
      |> # && #.replace('Bearer ', '');
  
    try {
      req.userId = jwt.verify(token, secret);
    } catch(error) {
      //
    } finally {
      next();
    }
  };

}