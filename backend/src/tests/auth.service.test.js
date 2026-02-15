import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../services/auth.service.js";
import prisma from "../config/prisma.js";
import * as hashUtils from "../utils/hash.js";
import * as jwtUtils from "../utils/jwt.js";

vi.mock("../config/prisma.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../utils/hash.js", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock("../utils/jwt.js", () => ({
  generateToken: vi.fn(),
}));


describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register()", () => {
    it("should register a new user successfully", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      hashUtils.hashPassword.mockResolvedValue("hashed-pass");
      prisma.user.create.mockResolvedValue({
        id: "1",
        username: "test",
        role: "USER",
      });
      jwtUtils.generateToken.mockReturnValue("jwt-token");

      const result = await authService.register({
        username: "<script>test</script>",
        firstName: "<b>Test</b>",
        lastName: "<i>User</i>",
        password: "123456",
      });

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.token).toBe("jwt-token");
      expect(result.user.username).toBe("test");
    });

    it("should return error if user exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "1" });

      const result = await authService.register({
        username: "test",
        password: "123",
      });

      expect(result.error).toBe("User already exists");
      expect(result.status).toBe(409);
    });
  });

  describe("login()", () => {
    it("should login successfully with valid credentials", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        username: "test",
        password: "hashed",
        role: "USER",
      });
      hashUtils.comparePassword.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue("jwt-token");

      const result = await authService.login("test", "123");

      expect(result.token).toBe("jwt-token");
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });

    it("should fail on invalid username", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await authService.login("wrong", "123");

      expect(result.error).toBe("Invalid credentials");
      expect(result.status).toBe(401);
    });

    it("should fail on wrong password", async () => {
      prisma.user.findUnique.mockResolvedValue({
        password: "hashed",
      });
      hashUtils.comparePassword.mockResolvedValue(false);

      const result = await authService.login("test", "wrong");

      expect(result.error).toBe("Invalid credentials");
      expect(result.status).toBe(401);
    });
  });
});
