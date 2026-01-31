import * as userService from "../services/user.service.js";
import { success, fail } from "../utils/response.js";

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
    success(res, result, "Profile updated");
  } catch (err) {
    next(err);
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await userService.adminUpdateUser(req.params.id, req.body);

    res.json({
      success: true,
      message: "User updated by admin",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    await userService.adminDeleteUser(req.params.id);

    res.json({
      success: true,
      message: "User deleted by admin",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      message: "Users fetched",
      data: users
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};