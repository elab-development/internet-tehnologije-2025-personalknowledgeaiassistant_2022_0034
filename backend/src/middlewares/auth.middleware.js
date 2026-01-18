import { verifyToken } from '../utils/jwt.js';
import { fail } from '../utils/response.js';

export default (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return fail(res, 'Unauthorized', 401);

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return fail(res, 'Invalid token', 401);
  }
};
