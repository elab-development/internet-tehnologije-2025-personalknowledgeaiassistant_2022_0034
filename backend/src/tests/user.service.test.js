import { describe, it, expect, vi, beforeEach } from "vitest";
import * as userController from "../controllers/user.controller.js";
import * as userService from "../services/user.service.js";
import { success, fail } from "../utils/response.js";

vi.mock("../services/user.service.js", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  adminUpdateUser: vi.fn(),
  adminDeleteUser: vi.fn(),
  getAllUsers: vi.fn(),
}));

vi.mock("../utils/response.js", () => ({
  success: vi.fn(),
  fail: vi.fn(),
}));

const mockRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
});

const mockNext = vi.fn();


describe("User Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("profile()", () => {
    it("should return user profile", async () => {
      const req = { user: { id: "user1" } };
      const res = mockRes();

      userService.getProfile.mockResolvedValue({ id: "user1", name: "Test" });

      await userController.profile(req, res, mockNext);

      expect(userService.getProfile).toHaveBeenCalledWith("user1");
      expect(success).toHaveBeenCalledWith(res, { id: "user1", name: "Test" });
    });

    it("should return error if service returns error", async () => {
      const req = { user: { id: "user1" } };
      const res = mockRes();

      userService.getProfile.mockResolvedValue({
        error: "User not found",
        status: 404,
      });

      await userController.profile(req, res, mockNext);

      expect(fail).toHaveBeenCalledWith(res, "User not found", 404);
    });
  });



  describe("update()", () => {
    it("should update user profile", async () => {
      const req = {
        user: { id: "user1" },
        body: { name: "New Name" },
      };
      const res = mockRes();

      userService.updateProfile.mockResolvedValue({ id: "user1", name: "New Name" });

      await userController.update(req, res, mockNext);

      expect(userService.updateProfile).toHaveBeenCalledWith("user1", req.body);
      expect(success).toHaveBeenCalledWith(
        res,
        { id: "user1", name: "New Name" },
        "Profile updated"
      );
    });
  });


  describe("updateUserByAdmin()", () => {
    it("should update user as admin", async () => {
      const req = {
        params: { id: "user2" },
        body: { role: "ADMIN" },
      };
      const res = mockRes();

      userService.adminUpdateUser.mockResolvedValue({
        id: "user2",
        role: "ADMIN",
      });

      await userController.updateUserByAdmin(req, res);

      expect(userService.adminUpdateUser).toHaveBeenCalledWith("user2", req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated by admin",
        data: { id: "user2", role: "ADMIN" },
      });
    });

    it("should return 400 if admin update fails", async () => {
      const req = {
        params: { id: "user2" },
        body: {},
      };
      const res = mockRes();

      userService.adminUpdateUser.mockRejectedValue(new Error("Invalid data"));

      await userController.updateUserByAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid data",
      });
    });
  });


  describe("deleteUserByAdmin()", () => {
    it("should delete user as admin", async () => {
      const req = { params: { id: "user3" } };
      const res = mockRes();

      userService.adminDeleteUser.mockResolvedValue();

      await userController.deleteUserByAdmin(req, res);

      expect(userService.adminDeleteUser).toHaveBeenCalledWith("user3");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted by admin",
      });
    });

    it("should return 400 if delete fails", async () => {
      const req = { params: { id: "user3" } };
      const res = mockRes();

      userService.adminDeleteUser.mockRejectedValue(new Error("Delete failed"));

      await userController.deleteUserByAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Delete failed",
      });
    });
  });

  /* ===== GET ALL USERS ===== */

  describe("getAllUsers()", () => {
    it("should return all users", async () => {
      const req = {};
      const res = mockRes();

      userService.getAllUsers.mockResolvedValue([{ id: "u1" }, { id: "u2" }]);

      await userController.getAllUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Users fetched",
        data: [{ id: "u1" }, { id: "u2" }],
      });
    });

    it("should return 400 if fetching users fails", async () => {
      const req = {};
      const res = mockRes();

      userService.getAllUsers.mockRejectedValue(new Error("DB error"));

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB error",
      });
    });
  });
});
