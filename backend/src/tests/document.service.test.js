import { describe, it, expect, vi, beforeEach } from "vitest";
import * as documentController from "../controllers/document.controller.js";
import * as documentService from "../services/document.service.js";
import { success, fail } from "../utils/response.js";


vi.mock("../services/document.service.js", () => ({
  createDocument: vi.fn(),
  getDocuments: vi.fn(),
  deleteDocument: vi.fn(),
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


describe("Document Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadDocument()", () => {
    it("should upload document successfully", async () => {
      const req = {
        user: { id: "user1" },
        file: { originalname: "test.pdf" },
      };
      const res = mockRes();

      documentService.createDocument.mockResolvedValue({ id: "doc1" });

      await documentController.uploadDocument(req, res, mockNext);

      expect(documentService.createDocument).toHaveBeenCalledWith("user1", req.file);
      expect(success).toHaveBeenCalledWith(res, { id: "doc1" }, "Document uploaded", 201);
    });

    it("should return error if no file uploaded", async () => {
      const req = { user: { id: "user1" } };
      const res = mockRes();

      await documentController.uploadDocument(req, res, mockNext);

      expect(fail).toHaveBeenCalledWith(res, "No file uploaded", 400);
    });
  });

  describe("getDocuments()", () => {
    it("should return documents for logged user", async () => {
      const req = { user: { id: "user1" } };
      const res = mockRes();

      documentService.getDocuments.mockResolvedValue([{ id: "doc1" }]);

      await documentController.getDocuments(req, res, mockNext);

      expect(documentService.getDocuments).toHaveBeenCalledWith("user1");
      expect(success).toHaveBeenCalledWith(res, [{ id: "doc1" }]);
    });
  });

  describe("getDocumentsByUser()", () => {
    it("should return documents for given user id", async () => {
      const req = { params: { id: "user2" } };
      const res = mockRes();

      documentService.getDocuments.mockResolvedValue([{ id: "doc2" }]);

      await documentController.getDocumentsByUser(req, res, mockNext);

      expect(documentService.getDocuments).toHaveBeenCalledWith("user2");
      expect(success).toHaveBeenCalledWith(res, [{ id: "doc2" }]);
    });
  });

  describe("deleteDocument()", () => {
    it("should delete document successfully", async () => {
      const req = {
        params: { id: "doc1" },
        user: { id: "user1" },
      };
      const res = mockRes();

      documentService.deleteDocument.mockResolvedValue({ message: "Document deleted" });

      await documentController.deleteDocument(req, res, mockNext);

      expect(documentService.deleteDocument).toHaveBeenCalledWith("doc1", "user1");
      expect(success).toHaveBeenCalledWith(
        res,
        { message: "Document deleted" },
        "Document deleted"
      );
    });

    it("should return error if service returns error", async () => {
      const req = {
        params: { id: "doc1" },
        user: { id: "user1" },
      };
      const res = mockRes();

      documentService.deleteDocument.mockResolvedValue({
        error: "Forbidden",
        status: 403,
      });

      await documentController.deleteDocument(req, res, mockNext);

      expect(fail).toHaveBeenCalledWith(res, "Forbidden", 403);
    });
  });
});
