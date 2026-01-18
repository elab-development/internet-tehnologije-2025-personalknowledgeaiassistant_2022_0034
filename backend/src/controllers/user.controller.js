import * as userService from '../services/user.service.js';
import { success, fail } from '../utils/response.js';

export const profile = async (req, res, next) => {
  try {
    const result = await userService.getProfile(req.user.id);
    if (result.error) return fail(res, result.error, result.status);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await userService.updateProfile(req.user.id, req.body);
    success(res, result, 'Profile updated');
  } catch (err) {
    next(err);
  }
};
