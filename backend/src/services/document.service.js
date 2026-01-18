import prisma from '../config/prisma.js';
import fs from 'fs';
import path from 'path';
import { parseDocument } from '../utils/parser.js';

const UPLOAD_DIR = './uploads';

export const createDocument = async (userId, file) => {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

  const filePath = path.join(UPLOAD_DIR, file.originalname);
  fs.writeFileSync(filePath, file.buffer);

  const document = await prisma.document.create({
    data: {
      fileName: file.originalname,
      fileType: file.mimetype.includes('pdf')
        ? 'PDF'
        : file.mimetype.includes('text')
        ? 'TXT'
        : 'MD',
      userId
    }
  });

  let segmentsContent = [];

  if (file.mimetype.includes('pdf')) {
    segmentsContent = await parseDocument(filePath);
  } else {
    segmentsContent = parseDocument(filePath);
  }

  for (let i = 0; i < segmentsContent.length; i++) {
    await prisma.segment.create({
      data: {
        content: segmentsContent[i],
        order: i + 1,
        embedding: [],
        documentId: document.id
      }
    });
  }

  return document;
};

export const getDocuments = async (userId) => {
  return await prisma.document.findMany({
    where: { userId },
    include: { segments: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const getDocumentById = async (id, userId) => {
  return await prisma.document.findFirst({
    where: { id, userId },
    include: { segments: true }
  });
};

export const deleteDocument = async (id, userId) => {
  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) return { error: 'Document not found', status: 404 };

  const filePath = path.join(UPLOAD_DIR, doc.fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.document.delete({ where: { id } });
  return { message: 'Document deleted' };
};