import * as authService from '../services/auth.service.js';
import { success, fail } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    if (result.error) return fail(res, result.error, result.status);
    success(res, result, 'User registered', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.username, req.body.password);
    if (result.error) return fail(res, result.error, result.status);
    success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};
