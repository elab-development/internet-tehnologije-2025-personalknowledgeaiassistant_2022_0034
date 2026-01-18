import prisma from "../config/prisma.js";
import { Ollama } from "@langchain/community/llms/ollama";
import { cosineSimilarity } from "../utils/embedding.js";
import { getEmbedding } from "../utils/embedding.js";

const llm = new Ollama({
  model: "llama3",
  baseUrl: "http://localhost:11434",
  temperature: 0,
});

const MAX_SEGMENTS = 5;

export const createQuestion = async (userId, query) => {
  const questionEmbedding = await getEmbedding(query);

  const question = await prisma.question.create({
    data: { query, answer: "", userId },
  });

  const segments = await prisma.segment.findMany({
    where: { document: { userId } },
  });

  const rankedSegments = segments
    .map((s) => ({
      ...s,
      score: cosineSimilarity(questionEmbedding, s.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SEGMENTS);

  const context = rankedSegments.map((s) => s.content).join("\n\n");

  const prompt = `
Odgovaraj samo na osnovu sledeceg konteksta koji pripada korisniku.
Ako odgovor ne postoji u kontekstu, reci: "Informacija nije pronađena u dokumentima".

KONTEKST:
${context}

PITANJE:
${query}
`;

  let answer = await llm.invoke(prompt);

  if (!answer || answer.length < 5 || answer.toLowerCase().includes("Informacija nije pronađena u dokumentima"))
    answer = "Informacija nije pronađena u dokumentima";

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
