import { fail } from "../utils/response.js";

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return fail(res, "Admin access only", 403);
  }

  next();
};