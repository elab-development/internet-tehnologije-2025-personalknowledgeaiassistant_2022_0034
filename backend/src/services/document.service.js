import prisma from "../config/prisma.js";
import fs from "fs";
import path from "path";
import { parseDocument } from "../utils/parser.js";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const UPLOAD_DIR = "./uploads";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

export const createDocument = async (userId, file) => {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

  const filePath = path.join(UPLOAD_DIR, file.originalname);
  fs.writeFileSync(filePath, file.buffer);

  const document = await prisma.document.create({
    data: {
      fileName: file.originalname,
      fileType: file.mimetype.includes("pdf")
        ? "PDF"
        : file.mimetype.includes("text")
          ? "TXT"
          : "MD",
      userId,
    },
  });

  const segmentsContent = parseDocument(filePath);

  for (let i = 0; i < segmentsContent.length; i++) {
    const segmentText = segmentsContent[i];
    const embedding = await embeddings.embedQuery(segmentText);

    await prisma.segment.create({
      data: {
        content: segmentText,
        order: i + 1,
        embedding, 
        documentId: document.id,
      },
    });
  }

  return document;
};

export const getDocuments = async (userId) => {
  return await prisma.document.findMany({
    where: { userId },
    include: { segments: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getDocumentById = async (id, userId) => {
  return await prisma.document.findFirst({
    where: { id, userId },
    include: { segments: true },
  });
};

export const deleteDocument = async (id, userId) => {
  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) return { error: "Document not found", status: 404 };

  const filePath = path.join(UPLOAD_DIR, doc.fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.document.delete({ where: { id } });
  return { message: "Document deleted" };
};
