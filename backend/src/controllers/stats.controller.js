import * as statsService from '../services/stats.service.js';
import { success, fail } from "../utils/response.js";

export const incrementModelUsage = async (modelName) => {
  try {
    await statsService.incrementUsage(modelName);
  } catch (err) {
    fail("Failed to increment model usage:", err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const result = await statsService.getAllStats();

    if (result.error) {
      return fail(res, result.error, result.status);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
};
