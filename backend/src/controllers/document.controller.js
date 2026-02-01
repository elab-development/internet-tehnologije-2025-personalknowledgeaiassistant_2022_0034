import * as documentService from '../services/document.service.js';
import { success, fail } from '../utils/response.js';

export const uploadDocument = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return fail(res, 'No file uploaded', 400);

    const document = await documentService.createDocument(req.user.id, file);
    success(res, document, 'Document uploaded', 201);
  } catch (err) {
    next(err);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const docs = await documentService.getDocuments(req.user.id);
    success(res, docs);
  } catch (err) {
    next(err);
  }
};
export const getDocumentsByUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const docs = await documentService.getDocuments(userId);
    
    success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const doc = await documentService.getDocumentById(req.params.id, req.user.id);
    if (!doc) return fail(res, 'Document not found', 404);
    success(res, doc);
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id, req.user.id);
    if (result.error) return fail(res, result.error, result.status);
    success(res, result, 'Document deleted');
  } catch (err) {
    next(err);
  }
};
