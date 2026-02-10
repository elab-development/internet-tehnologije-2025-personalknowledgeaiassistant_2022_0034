import prisma from "../config/prisma.js";
import fs from "fs";
import path from "path";
import { parseDocument } from "../utils/parser.js";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { normalize } from "../utils/embedding.js";
import { v4 as uuid } from "uuid";
import xss from "xss";

const UPLOAD_DIR = "./uploads";
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: OLLAMA_URL,
});

export const createDocument = async (userId, file) => {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

  const safeFileName = xss(file.originalname);
  const filePath = path.join(UPLOAD_DIR, safeFileName);
  fs.writeFileSync(filePath, file.buffer);

  const document = await prisma.document.create({
    data: {
      fileName: safeFileName,
      fileType: file.mimetype.includes("pdf")
        ? "PDF"
        : file.mimetype.includes("text")
          ? "TXT"
          : "MD",
      userId,
    },
  });

  const segmentsContent = await parseDocument(filePath);

  for (let i = 0; i < segmentsContent.length; i++) {
    const segmentText = xss(segmentsContent[i]);

    const raw = await embeddings.embedDocuments([segmentText]);
    const embedding = normalize(raw[0]);

    await prisma.$executeRaw`
      INSERT INTO "Segment" ("id", "content", "order", "embedding", "documentId", "createdAt")
      VALUES (
        ${uuid()},
        ${segmentText},
        ${i + 1},
        ${`[${embedding.join(",")}]`}::vector,
        ${document.id},
        now()
      )
    `;
  }

  return document;
};

export const getDocuments = async (userId) => {
  const docs = await prisma.document.findMany({
    where: { userId },
    include: { segments: true },
    orderBy: { createdAt: "desc" },
  });

  return docs.map(doc => ({
    ...doc,
    fileName: xss(doc.fileName),
    segments: doc.segments.map(seg => ({ ...seg, content: xss(seg.content) }))
  }));
};

export const deleteDocument = async (id, userId) => {
  const doc = await prisma.document.findUnique({
    where: { id },
  });

  if (!doc) return { error: "Document not found", status: 404 };

  // IDOR zaštita
  if (doc.userId !== userId) return { error: "Forbidden", status: 403 };

  const filePath = path.join(UPLOAD_DIR, doc.fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.document.delete({
    where: { id },
  });

  return { message: "Document deleted" };
};
