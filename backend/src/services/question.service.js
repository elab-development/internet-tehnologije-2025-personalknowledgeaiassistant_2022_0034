import prisma from "../config/prisma.js";
import { Ollama } from "@langchain/community/llms/ollama";
import { getEmbedding } from "../utils/embedding.js";
import { normalize } from "../utils/embedding.js";

const llm = new Ollama({
  model: "llama3",
  baseUrl: "http://localhost:11434",
  system: `
Odgovaraj isključivo koristeći dati kontekst."
`,
  temperature: 0.1,
  top_p: 0.9,
});

const TOP_K = 5;

export const createQuestion = async (userId, query) => {
  const question = await prisma.question.create({
    data: { query, answer: "", userId },
  });

  const raw = await getEmbedding(query);
  const questionEmbedding = normalize(raw);

  const segments = await prisma.$queryRaw`
  SELECT content
  FROM "Segment" s
  JOIN "Document" d ON d.id = s."documentId"
  WHERE d."userId" = ${userId}
  ORDER BY s.embedding <-> ${`[${questionEmbedding.join(",")}]`}::vector
  LIMIT ${TOP_K}
`;

  const context = segments.map((s) => s.content).join("\n\n");

  const prompt = `
KONTEKST:
${context}

PITANJE:
${query}

Odgovori jasno i precizno, koristeći samo informacije iz konteksta.
Ako informacije ne postoje u kotekstu napisi samo: Inforamcija nije pronadjena u dokumentima.
`;

  let answer = await llm.invoke(prompt);

  if (!answer || answer.toLocaleLowerCase().includes("nije definisan") || answer.toLocaleLowerCase().includes("nije pronadjen")) answer = "Informacija nije pronađena u dokumentima";

  await prisma.question.update({
    where: { id: question.id },
    data: { answer },
  });

  return { question, answer };
};

export const getQuestions = async (userId) => {
  return await prisma.question.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { segments: { include: { segment: true } } },
  });
};
