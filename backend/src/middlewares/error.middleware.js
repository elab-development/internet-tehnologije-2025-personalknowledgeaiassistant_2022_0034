import { fail } from '../utils/response.js';

export default (err, req, res, next) => {
  console.error(err);
  return fail(res, err.message || 'Internal server error', 500);
};
